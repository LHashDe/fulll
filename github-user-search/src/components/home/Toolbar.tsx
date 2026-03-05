import { memo } from "react";
import { useGithubUsersContext } from "./GithubUsersContextProvider";

//toolbar component for the github users
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
              <img src={"/icons/duplicateIcon.svg"} alt="Duplicate" width={20} height={20} />
            </button>
            <button
              className="action-btn action-btn-delete"
              onClick={deleteSelected}
              title="Delete selected"
              aria-label="Delete selected items"
            >
              <img src={"/icons/deleteIcon.svg"} alt="Delete" width={20} height={20} className="action-btn-delete-icon" />
            </button>
          </div>
        )}
        <button
          className={`edit-toggle ${isEditMode ? "edit-toggle-active" : ""}`}
          onClick={handleToggleEditMode}
          title={isEditMode ? "Exit edit mode" : "Enter edit mode"}
          aria-pressed={isEditMode}
        >
          <img src={"/icons/editIcon.svg"} alt="Edit" width={20} height={20} />
        </button>
      </div>
    </div>
  );
});
