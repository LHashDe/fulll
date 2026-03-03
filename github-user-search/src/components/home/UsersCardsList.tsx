import { useCallback } from "react";
import { useGithubUsersContext } from "./GithubUsersContextProvider";
import UserCard from "./UserCard";

export default function UsersCardsList() {
  const { users, isLoading, isEditMode, selectedUserIds, toggleSelection } =
    useGithubUsersContext();

  const handleToggleSelection = useCallback(
    (internalId: string) => toggleSelection(internalId),
    [toggleSelection],
  );

  if (isLoading) return null;

  if (users.length === 0) {
    return (
      <div className="no-results">
        <span className="no-results_icon">🔍</span>
        <span className="no-results_message">No users found</span>
        <span className="no-results_hint">Try a different search term</span>
      </div>
    );
  }

  return (
    <div className="users-grid">
      {users.map((user) => (
        <UserCard
          key={user.internalId}
          user={user}
          isSelected={selectedUserIds.has(user.internalId)}
          isEditMode={isEditMode}
          onToggleSelection={handleToggleSelection}
        />
      ))}
    </div>
  );
}
