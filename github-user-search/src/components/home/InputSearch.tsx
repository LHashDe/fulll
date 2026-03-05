import { memo } from "react";
import { useGithubUsersContext } from "./GithubUsersContextProvider";

const InputSearch = memo(function InputSearch() {
  const { searchValue, handleSearchChange } = useGithubUsersContext();

  return (
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search Github users..."
        aria-label="Search Github users"
        value={searchValue}
        onChange={handleSearchChange}
      />
    </div>
  );
});

export default InputSearch;
