import React from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, ShieldCheck, KeyRound } from "lucide-react";

/**
 * RoleTable
 * Presentational table — receives already-filtered roles and renders them.
 *
 * Supports native navigation and Ctrl+Click / Cmd+Click (open in new tab).
 *
 * Props:
 * - roles (array)
 * - loading (bool)
 * - onEdit (fn)   : called with the role object
 * - onDelete (fn) : called with the role object
 */
export default function RoleTable({ roles, loading, onEdit, onDelete }) {
  if (loading && roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-base-content/40 gap-2">
        <span className="loading loading-spinner loading-md" />
        <p className="text-sm">Loading roles…</p>
      </div>
    );
  }

  if (!loading && roles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
        <span className="flex items-center justify-center w-11 h-11 rounded-full bg-base-300 text-base-content/40">
          <ShieldCheck size={20} />
        </span>
        <p className="text-sm font-medium text-base-content/70">
          No roles found
        </p>
        <p className="text-xs text-base-content/40">
          Create your first role to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-base-content/50 border-b border-base-300">
              <th className="w-14 font-medium">#</th>
              <th className="font-medium">Role</th>
              <th className="font-medium">Description</th>
              <th className="font-medium w-32">Status</th>
              <th className="text-right font-medium w-36">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role, index) => {
              const permPath = `/role-permissions/${role.id}`;

              return (
                <tr
                  key={role.id}
                  className="border-b border-base-200 last:border-0 hover:bg-base-200/50 transition-colors"
                >
                  <td className="text-base-content/40">{index + 1}</td>

                  <td>
                    <Link
                      to={permPath}
                      state={{ roleId: role.id }}
                      className="flex items-center gap-3 py-1 group no-underline text-inherit"
                      title="Click or Ctrl+Click to open permissions in new tab"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-content transition-colors">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="font-bold text-sm group-hover:text-primary transition-colors">
                          {role.name}
                        </div>
                        <div className="text-[11px] text-base-content/40">
                          ID: #{role.id}
                        </div>
                      </div>
                    </Link>
                  </td>

                  <td className="max-w-md">
                    <p
                      className="truncate text-sm text-base-content/60"
                      title={role.description || ""}
                    >
                      {role.description || (
                        <span className="text-base-content/30">
                          No description
                        </span>
                      )}
                    </p>
                  </td>

                  <td>
                    <span
                      className={`badge gap-1.5 font-medium ${
                        role.status === "inactive"
                          ? "badge-error badge-outline"
                          : "badge-success badge-outline"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {role.status === "inactive" ? "Inactive" : "Active"}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-end gap-1">
                      {/* Direct Navigate to Role Permissions — supports Ctrl+Click */}
                      <Link
                        to={permPath}
                        state={{ roleId: role.id }}
                        className="btn btn-ghost btn-sm btn-square text-primary hover:bg-primary/10"
                        aria-label={`Configure permissions for ${role.name}`}
                        title="Configure Role Permissions (Ctrl+Click to open in new tab)"
                      >
                        <KeyRound size={15} />
                      </Link>

                      <button
                        className="btn btn-ghost btn-sm btn-square"
                        onClick={() => onEdit(role)}
                        aria-label={`Edit ${role.name}`}
                        title="Edit role"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                        onClick={() => onDelete(role)}
                        aria-label={`Delete ${role.name}`}
                        title="Delete role"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
