import supabase from "./supabase.js";
import { logger } from '../utils/logger.js';

/** PostgREST `in.(...)` list for text ids that may contain special characters (e.g. Upwork `~…` ids). */
function postgrestInTuple(values) {
    const escaped = values
        .map((v) => `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
        .join(",");
    return `(${escaped})`;
}

// ── Preferences ──────────────────────────────────────────────────

export async function getSavedSearches(userId) {
    logger.debug(`Getting saved searches for user: ${userId}`);
    const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function upsertSavedSearch(userId, search) {
    const payload = {
        ...search,
        user_id: userId,
        updated_at: new Date().toISOString(),
    };
    // If id is explicitly null or undefined, let DB generate it.
    if (!payload.id) delete payload.id;

    const { data, error } = await supabase
        .from("saved_searches")
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteSavedSearch(userId, searchId) {
    const { error } = await supabase
        .from("saved_searches")
        .delete()
        .eq("id", searchId)
        .eq("user_id", userId);
    if (error) throw error;
    return true;
}

// ── Jobs ─────────────────────────────────────────────────────────

export async function upsertJobs(jobs) {
    if (!jobs.length) return [];
    const { data, error } = await supabase
        .from("jobs")
        .upsert(
            jobs.map((j) => ({
                ...j,
                last_fetched_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })),
            { onConflict: "id" }
        )
        .select();
    if (error) throw error;
    return data;
}

export async function getJobs({
    sort = "score",
    limit = 20,
    offset = 0,
    userId,
    searchId,
} = {}) {
    // For score sorting, we need to build the query differently
    if (sort === "score" && searchId) {
        // Query job_scores first, then join to jobs
        let query = supabase
            .from("job_scores")
            .select(
                `
        job_id,
        score,
        reasoning,
        risk_score,
        skill_match_score,
        budget_match_score,
        client_quality_score,
        computed_at,
        jobs(
          *,
          user_feedback!left(feedback)
        )
      `
            )
            .eq("saved_search_id", searchId)
            .eq("jobs.is_active", true)
            .order("score", { ascending: false, nullsFirst: false })
            .range(offset, offset + limit - 1);

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((scoreRecord) => {
            const job = scoreRecord.jobs;
            const feedback = job?.user_feedback?.[0] || null;
            const { user_feedback, ...jobRest } = job || {};
            return {
                ...jobRest,
                score: scoreRecord.score || null,
                reasoning: scoreRecord.reasoning || null,
                risk_score: scoreRecord.risk_score || null,
                skill_match_score: scoreRecord.skill_match_score || null,
                budget_match_score: scoreRecord.budget_match_score || null,
                client_quality_score: scoreRecord.client_quality_score || null,
                scored_at: scoreRecord.computed_at || null,
                feedback: feedback?.feedback || null,
            };
        });
    }

    // For other sorts, use the original approach
    const scoreJoin = searchId ? "job_scores!inner" : "job_scores!left";
    let query = supabase
        .from("jobs")
        .select(
            `
      *,
      ${scoreJoin}(score, reasoning, risk_score, skill_match_score, budget_match_score, client_quality_score, computed_at),
      user_feedback!left(feedback)
    `
        )
        .eq("is_active", true);

    if (searchId) {
        query = query.eq("job_scores.saved_search_id", searchId);
    }

    if (sort === "recency") {
        query = query.order("posted_at", { ascending: false });
    } else if (sort === "proposals") {
        query = query.order("proposal_count", { ascending: true });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    // Flatten scores into job object
    return (data || []).map((job) => {
        const score = job.job_scores?.[0] || null;
        const feedback = job.user_feedback?.[0] || null;
        const { job_scores, user_feedback, ...rest } = job;
        return {
            ...rest,
            score: score?.score || null,
            reasoning: score?.reasoning || null,
            risk_score: score?.risk_score || null,
            skill_match_score: score?.skill_match_score || null,
            budget_match_score: score?.budget_match_score || null,
            client_quality_score: score?.client_quality_score || null,
            scored_at: score?.computed_at || null,
            feedback: feedback?.feedback || null,
        };
    });
}

export async function getJobById(jobId, userId, searchId) {
    const scoreJoin = searchId ? "job_scores!inner" : "job_scores!left";
    let query = supabase
        .from("jobs")
        .select(
            `
      *,
      ${scoreJoin}(score, reasoning, risk_score, skill_match_score, budget_match_score, client_quality_score, computed_at),
      user_feedback!left(feedback, note)
    `
        )
        .eq("id", jobId);

    if (searchId) {
        query = query.eq("job_scores.saved_search_id", searchId);
    }

    const { data, error } = await query.single();

    if (error) throw error;

    const score = data.job_scores?.[0] || null;
    const feedback = data.user_feedback?.[0] || null;
    const { job_scores, user_feedback, ...rest } = data;
    return {
        ...rest,
        score: score?.score || null,
        reasoning: score?.reasoning || null,
        risk_score: score?.risk_score || null,
        skill_match_score: score?.skill_match_score || null,
        budget_match_score: score?.budget_match_score || null,
        client_quality_score: score?.client_quality_score || null,
        scored_at: score?.computed_at || null,
        feedback: feedback?.feedback || null,
        feedback_note: feedback?.note || null,
    };
}

export async function getJobCount() {
    const { count, error } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
    if (error) throw error;
    return count || 0;
}

// ── Job Fetch Log ────────────────────────────────────────────────

export async function insertJobFetchLogStart({ userId, savedSearchId, startedAt = new Date().toISOString() }) {
  const { data, error } = await supabase
    .from('job_fetch_log')
    .insert({
      user_id: userId,
      saved_search_id: savedSearchId,
      started_at: startedAt,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completeJobFetchLog({
  id,
  fetchedCount = 0,
  apiCallsUsed = 0,
  completedAt = new Date().toISOString(),
  status = 'success',
  errorMessage = null,
}) {
  const { data, error } = await supabase
    .from('job_fetch_log')
    .update({
      fetched_count: fetchedCount,
      api_calls_used: apiCallsUsed,
      completed_at: completedAt,
      status,
      error_message: errorMessage,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLatestFetchCompletedAt(userId, savedSearchId) {
  const { data, error } = await supabase
    .from('job_fetch_log')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('saved_search_id', savedSearchId)
    .eq('status', 'success')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.completed_at || null;
}

// ── Scores ───────────────────────────────────────────────────────

export async function upsertJobScores(scores) {
    logger.info(`Upserting ${scores.length} job scores`);
    if (!scores.length) return [];
    const { data, error } = await supabase
        .from("job_scores")
        .upsert(scores, { onConflict: "job_id,saved_search_id" })
        .select();
    if (error) throw error;
    return data;
}

export async function getUnscoredJobs(searchId, limit = 10) {
    // Get jobs that don't have a score for this search
    const { data: scoredIds } = await supabase
        .from("job_scores")
        .select("job_id")
        .eq("saved_search_id", searchId);

    const scoredJobIds = (scoredIds || []).map((s) => s.job_id);

    let query = supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .order("posted_at", { ascending: false })
        .limit(limit);

    if (scoredJobIds.length > 0) {
        // `.not('id','in', array)` stringifies the array unquoted; ids like `~0123` break PostgREST.
        query = query.not("id", "in", postgrestInTuple(scoredJobIds));
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// ── Feedback ─────────────────────────────────────────────────────

export async function addFeedback(userId, jobId, feedback, note) {
    const { data, error } = await supabase
        .from("user_feedback")
        .upsert(
            {
                user_id: userId,
                job_id: jobId,
                feedback,
                note,
                created_at: new Date().toISOString(),
            },
            { onConflict: "user_id,job_id", ignoreDuplicates: false }
        )
        .select()
        .single();
    // If upsert fails due to no unique constraint on (user_id, job_id), fall back to insert
    if (error) {
        const { data: insertData, error: insertError } = await supabase
            .from("user_feedback")
            .insert({ user_id: userId, job_id: jobId, feedback, note })
            .select()
            .single();
        if (insertError) throw insertError;
        return insertData;
    }
    return data;
}

// ── Cleanup ──────────────────────────────────────────────────────

export async function cleanupStaleJobs(hoursOld = 24) {
    const cutoff = new Date(
        Date.now() - hoursOld * 60 * 60 * 1000
    ).toISOString();
    const { data, error } = await supabase
        .from("jobs")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .lt("posted_at", cutoff)
        .eq("is_active", true)
        .select("id");
    if (error) throw error;
    return data?.length || 0;
}

export async function getStats(userId) {
    const totalJobs = await getJobCount();

    const { count: highMatchCount } = await supabase
        .from("job_scores")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("score", 80);

    return {
        totalJobsScanned: totalJobs,
        highMatchAlerts: highMatchCount || 0,
    };
}
