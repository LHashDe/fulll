import { useGithubUsersContext } from "./GithubUsersContextProvider";

function InputSearch() {
  const { handleSearchChange, searchValue } = useGithubUsersContext();

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
}

export default InputSearch;
