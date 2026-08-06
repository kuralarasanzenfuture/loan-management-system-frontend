import React from "react";
import { Pencil, Trash2, UserRound, Phone, Mail } from "lucide-react";

const STATUS_STYLES = {
  active: "badge-success badge-outline",
  inactive: "badge-warning badge-outline",
  blocked: "badge-error badge-outline",
};

/**
 * UserTable
 * Presentational table — receives already-filtered/paginated users.
 * Matches schema: { id, username, email, mobile, status, role_id, role, last_login }
 *
 * Props:
 * - users (array)
 * - loading (bool)
 * - roleMap (object)  : { [role_id]: roleName } for display, since users only store role_id
 * - onEdit (fn)   : called with the user object
 * - onDelete (fn) : called with the user object
 */
export default function UserTable({
  users,
  loading,
  roleMap = {},
  onEdit,
  onDelete,
}) {
  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading users…</p>
      </div>
    );
  }

  if (!loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <UserRound size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No users found
        </p>
        <p className="text-xs text-base-content/40">
          Create your first user to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
            <th className="w-14 font-medium">#</th>
            <th className="font-medium">User</th>
            <th className="font-medium">Contact</th>
            <th className="font-medium w-36">Role</th>
            <th className="font-medium w-28">Status</th>
            <th className="font-medium w-36">Last Login</th>
            <th className="text-right font-medium w-28">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
            >
              <td className="text-base-content/40">{index + 1}</td>

              <td>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary shrink-0 uppercase text-xs font-bold">
                    {user.username?.slice(0, 2) || <UserRound size={16} />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{user.username}</div>
                    <div className="text-[11px] text-base-content/40">
                      ID: {user.id}
                    </div>
                  </div>
                </div>
              </td>

              <td>
                <div className="flex flex-col gap-0.5 text-xs text-base-content/60">
                  {user.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} className="text-base-content/30" />
                      {user.email}
                    </span>
                  )}
                  {user.mobile && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={12} className="text-base-content/30" />
                      {user.mobile}
                    </span>
                  )}
                  {!user.email && !user.mobile && (
                    <span className="text-base-content/30">
                      No contact info
                    </span>
                  )}
                </div>
              </td>

              <td>
                <span className="badge badge-ghost badge-sm font-medium">
                  {/* {roleMap[user.role_id] || `Role #${user.role_id}`} */}
                  {user.role_name}
                </span>
              </td>

              <td>
                <span
                  className={`badge gap-1.5 font-medium ${STATUS_STYLES[user.status] || "badge-ghost"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {user.status
                    ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                    : "Unknown"}
                </span>
              </td>

              <td className="text-xs text-base-content/50">
                {user.last_login ? (
                  new Date(user.last_login).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                ) : (
                  <span className="text-base-content/30">Never</span>
                )}
              </td>

              <td>
                <div className="flex justify-end gap-1.5">
                  <button
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => onEdit(user)}
                    aria-label={`Edit ${user.username}`}
                    title="Edit user"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                    onClick={() => onDelete(user)}
                    aria-label={`Delete ${user.username}`}
                    title="Delete user"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
