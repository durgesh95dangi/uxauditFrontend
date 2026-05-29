"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PageToolbar from "../layout/PageToolbar.jsx";
import AdminConfirmDialog from "./AdminConfirmDialog.jsx";
import AdminPageHeader from "./AdminPageHeader.jsx";
import AdminUserModal from "./AdminUserModal.jsx";
import {
  JobsTable,
  adminFetch,
  formatDate,
  handleAdminForbidden
} from "./adminShared.jsx";

export default function AdminUserDetail({ userId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);
  const [deleteJobTarget, setDeleteJobTarget] = useState(null);
  const [busyJobId, setBusyJobId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (await handleAdminForbidden(response, router)) return;
      if (response.status === 404) {
        setError("User not found");
        return;
      }
      if (!response.ok) throw new Error("Could not load user");
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err?.message || "Could not load user");
    } finally {
      setLoading(false);
    }
  }, [router, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSaveUser(payload) {
    setModalLoading(true);
    setModalError(null);
    try {
      const data = await adminFetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: payload.fullName,
          password: payload.password || undefined
        })
      });
      setUser(data.user);
      setUserModalOpen(false);
    } catch (err) {
      setModalError(err?.message || "Could not update user");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteUser() {
    setDeleteUserLoading(true);
    setError(null);
    try {
      await adminFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Could not delete user");
      setDeleteUserLoading(false);
    }
  }

  async function handleCancelJob(job) {
    setBusyJobId(job.id);
    setError(null);
    try {
      await adminFetch(`/api/admin/jobs/${job.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "failed" })
      });
      await loadData();
    } catch (err) {
      setError(err?.message || "Could not cancel audit");
    } finally {
      setBusyJobId(null);
    }
  }

  async function handleDeleteJob() {
    if (!deleteJobTarget) return;
    setBusyJobId(deleteJobTarget.id);
    setError(null);
    try {
      await adminFetch(`/api/admin/jobs/${deleteJobTarget.id}`, {
        method: "DELETE"
      });
      setDeleteJobTarget(null);
      await loadData();
    } catch (err) {
      setError(err?.message || "Could not delete audit");
    } finally {
      setBusyJobId(null);
    }
  }

  return (
    <div className="admin-page">
      <PageToolbar backHref="/admin/users" backLabel="← Users" />

      <AdminPageHeader
        title={user?.email || "User details"}
        subtitle={
          user
            ? `${user.fullName || "Registered user"} · ${user.auditCount ?? 0} audits`
            : "Loading user profile"
        }
        onRefresh={loadData}
        loading={loading}
        actions={
          user ? (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setModalError(null);
                  setUserModalOpen(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm admin-btn-danger"
                onClick={() => setDeleteUserOpen(true)}
              >
                Delete user
              </button>
            </>
          ) : null
        }
      />

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {user && (
        <section className="dashboard-panel admin-detail-panel">
          <div className="admin-detail-grid">
            <div className="admin-detail-card">
              <span className="admin-detail-label">Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className="admin-detail-card">
              <span className="admin-detail-label">Provider</span>
              <strong>{user.provider}</strong>
            </div>
            <div className="admin-detail-card">
              <span className="admin-detail-label">Joined</span>
              <strong>{formatDate(user.createdAt)}</strong>
            </div>
            <div className="admin-detail-card">
              <span className="admin-detail-label">Last sign-in</span>
              <strong>{formatDate(user.lastSignInAt)}</strong>
            </div>
            <div className="admin-detail-card">
              <span className="admin-detail-label">Completed audits</span>
              <strong>{user.auditsDone ?? 0}</strong>
            </div>
            <div className="admin-detail-card">
              <span className="admin-detail-label">Failed audits</span>
              <strong>{user.auditsFailed ?? 0}</strong>
            </div>
          </div>
        </section>
      )}

      <section className="recent-audits dashboard-panel admin-panel" aria-label="User reports">
        <header className="recent-audits-head dashboard-panel-head">
          <h2 className="recent-audits-title dashboard-panel-title">Reports generated</h2>
          <span className="admin-count">{user?.jobs?.length ?? 0} total</span>
        </header>

        {loading && !user ? (
          <p className="admin-empty">Loading reports…</p>
        ) : (
          <JobsTable
            jobs={user?.jobs || []}
            showUser={false}
            emptyLabel="No reports from this user yet"
            onDeleteJob={(job) => setDeleteJobTarget(job)}
            onCancelJob={handleCancelJob}
            busyJobId={busyJobId}
          />
        )}
      </section>

      <AdminUserModal
        open={userModalOpen}
        mode="edit"
        initialUser={user}
        loading={modalLoading}
        error={modalError}
        onClose={() => setUserModalOpen(false)}
        onSubmit={handleSaveUser}
      />

      <AdminConfirmDialog
        open={deleteUserOpen}
        title="Delete user"
        message={`Delete ${user?.email}? This removes all of their audits and reports.`}
        loading={deleteUserLoading}
        onCancel={() => setDeleteUserOpen(false)}
        onConfirm={handleDeleteUser}
      />

      <AdminConfirmDialog
        open={Boolean(deleteJobTarget)}
        title="Delete audit"
        message={`Delete the audit for ${deleteJobTarget?.url || "this URL"}?`}
        loading={busyJobId === deleteJobTarget?.id}
        onCancel={() => setDeleteJobTarget(null)}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}
