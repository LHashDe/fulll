import { memo, useCallback } from "react";
import type { DisplayUser } from "../../hooks/github-users/use-github-users";

type UserCardProps = {
  user: DisplayUser;
  isSelected: boolean;
  isEditMode: boolean;
  onToggleSelection: (internalId: string) => void;
};

const UserCard = memo(function UserCard({
  user,
  isSelected,
  isEditMode,
  onToggleSelection,
}: UserCardProps) {
  const handleToggleSelection = useCallback(() => {
    onToggleSelection(user.internalId);
  }, [onToggleSelection, user.internalId]);

  return (
    <article className={`user-card ${isSelected ? "user-card-selected" : ""}`}>
      {isEditMode && (
        <label className="user-card_checkbox-wrapper">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelection}
            className="checkbox"
            aria-label={`Select ${user.login}`}
          />
        </label>
      )}

      <div className="user-card_avatar-wrapper">
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          className="user-card_avatar"
          loading="lazy"
        />
      </div>

      <div className="user-card_info">
        <span className="user-card_id">ID: {user.id}</span>
        <span className="user-card_login">{user.login}</span>
      </div>

      <a
        href={user.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="user-card_link"
      >
        View profile
      </a>
    </article>
  );
});

export default UserCard;
