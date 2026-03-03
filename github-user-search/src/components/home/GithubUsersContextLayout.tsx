import InputSearch from "./InputSearch";
import { Toolbar } from "./Toolbar";
import { useGithubUsersContext } from "./GithubUsersContextProvider";
import UsersCardsList from "./UsersCardsList";

export default function GithubUsersContextLayout() {
  const { isLoading, error } = useGithubUsersContext();
  return (
    <>
      <InputSearch />
      <Toolbar />

      {isLoading && (
        <div className="loading">
          <div className="loading_spinner" />
          <span>Searching...</span>
        </div>
      )}

      {error && (
        <div className="error">
          <span className="error_icon">⚠️</span>
          <span className="error_message">{error.message}</span>
        </div>
      )}

      <section className="content">
        <UsersCardsList />
      </section>
    </>
  );
}
