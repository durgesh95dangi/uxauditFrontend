"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminConfirmDialog from "./AdminConfirmDialog.jsx";
import AdminPageHeader from "./AdminPageHeader.jsx";
import AdminUserModal from "./AdminUserModal.jsx";
import { adminFetch, formatDate, handleAdminForbidden } from "./adminShared.jsx";

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/users");
      if (await handleAdminForbidden(response, router)) return;
      if (!response.ok) throw new Error("Could not load users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err?.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateModal() {
    setEditUser(null);
    setModalError(null);
    setUserModalOpen(true);
  }

  function openEditModal(user) {
    setEditUser(user);
    setModalError(null);
    setUserModalOpen(true);
  }

  async function handleSaveUser(payload) {
    setModalLoading(true);
    setModalError(null);
    try {
      if (editUser) {
        await adminFetch(`/api/admin/users/${editUser.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            fullName: payload.fullName,
            password: payload.password || undefined
          })
        });
      } else {
        await adminFetch("/api/admin/users", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }
      setUserModalOpen(false);
      await loadData();
    } catch (err) {
      setModalError(err?.message || "Could not save user");
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await adminFetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE"
      });
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(err?.message || "Could not delete user");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Users"
        subtitle="Create, update, and remove registered users"
        onRefresh={loadData}
        loading={loading}
        actions={
          <button type="button" className="btn btn-primary btn-sm" onClick={openCreateModal}>
            Add user
          </button>
        }
      />

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      <section className="recent-audits dashboard-panel admin-panel" aria-label="Registered users">
        <header className="recent-audits-head dashboard-panel-head">
          <h2 className="recent-audits-title dashboard-panel-title">All users</h2>
          <span className="admin-count">{users.length} total</span>
        </header>

        <div className="recent-audits-table-wrap">
          <table className="recent-audits-table admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Provider</th>
                <th>Audits</th>
                <th>Joined</th>
                <th>Last sign-in</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((row) => (
                  <tr key={row.id}>
                    <td className="admin-email" title={row.email}>
                      {row.email}
                    </td>
                    <td>{row.fullName || "—"}</td>
                    <td className="admin-muted">{row.provider}</td>
                    <td>
                      {row.auditCount}
                      {row.auditsDone > 0 && (
                        <span className="admin-muted"> ({row.auditsDone} done)</span>
                      )}
                    </td>
                    <td className="admin-date">{formatDate(row.createdAt)}</td>
                    <td className="admin-date">{formatDate(row.lastSignInAt)}</td>
                    <td className="ra-action admin-row-actions">
                      <Link
                        href={`/admin/users/${row.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View
                      </Link>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEditModal(row)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm admin-btn-danger"
                        onClick={() => setDeleteTarget(row)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AdminUserModal
        open={userModalOpen}
        mode={editUser ? "edit" : "create"}
        initialUser={editUser}
        loading={modalLoading}
        error={modalError}
        onClose={() => setUserModalOpen(false)}
        onSubmit={handleSaveUser}
      />

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        message={`Delete ${deleteTarget?.email}? This removes all of their audits and reports.`}
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
