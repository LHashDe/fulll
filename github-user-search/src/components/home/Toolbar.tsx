import { memo } from "react";
import { useGithubUsersContext } from "./GithubUsersContextProvider";
import { DuplicateIcon, DeleteIcon, EditIcon } from "../icons";

export const Toolbar = memo(function Toolbar() {
  const {
    isEditMode,
    handleToggleEditMode,
    users,
    selectedCount,
    isAllSelected,
    isPartiallySelected,
    toggleSelectAll,
    duplicateSelected,
    deleteSelected,
  } = useGithubUsersContext();

  return (
    <div className="toolbar">
      <div className="toolbar_left">
        {isEditMode && users.length > 0 && (
          <label className="select-all">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isPartiallySelected;
              }}
              onChange={toggleSelectAll}
              className="checkbox"
            />
            <span className="select-all_label">
              {selectedCount} element{selectedCount !== 1 ? "s" : ""} selected
            </span>
          </label>
        )}
      </div>

      <div className="toolbar_right">
        {isEditMode && selectedCount > 0 && (
          <div className="actions">
            <button
              className="action-btn action-btn-duplicate"
              onClick={duplicateSelected}
              title="Duplicate selected"
              aria-label="Duplicate selected items"
            >
              <DuplicateIcon />
            </button>
            <button
              className="action-btn action-btn-delete"
              onClick={deleteSelected}
              title="Delete selected"
              aria-label="Delete selected items"
            >
              <DeleteIcon />
            </button>
          </div>
        )}
        <button
          className={`edit-toggle ${isEditMode ? "edit-toggle-active" : ""}`}
          onClick={handleToggleEditMode}
          title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
          aria-pressed={isEditMode}
        >
          <EditIcon />
        </button>
      </div>
    </div>
  );
});
