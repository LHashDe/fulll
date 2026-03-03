import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type ChangeEvent,
} from "react";
import {
  useGithubUsers,
  type DisplayUser,
} from "../../hooks/github-users/use-github-users";
import { useDebounce } from "../../hooks/use-debounce";

type GithubUsersContextValue = {
  users: DisplayUser[];
  isLoading: boolean;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  error: { message: string; status: number } | null;

  searchValue: string;
  handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;

  isEditMode: boolean;
  handleToggleEditMode: () => void;
  selectedUserIds: Set<string>;
  selectedCount: number;
  toggleSelection: (internalId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleSelectAll: () => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
};

const GithubUsersContext = createContext<GithubUsersContextValue | null>(null)

export default function GithubUsersContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const {
    users,
    error,
    isLoading,
    duplicateSelected,
    search,
    deleteSelected,
    selectedUserIds,
    setSelectedUserIds,
    selectedCount,
  } = useGithubUsers();

  const toggleSelection = useCallback((internalId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(internalId)) {
        next.delete(internalId);
      } else {
        next.add(internalId);
      }
      return next;
    });
  }, [setSelectedUserIds]);

  const selectAll = useCallback(() => {
    setSelectedUserIds(new Set(users.map((u) => u.internalId)));
  }, [users, setSelectedUserIds]);

  const deselectAll = useCallback(() => {
    setSelectedUserIds(new Set());
  }, [setSelectedUserIds]);

  const toggleSelectAll = useCallback(() => {
    if (selectedUserIds.size === users.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedUserIds.size, users.length, selectAll, deselectAll]);

  const isAllSelected =
    users.length > 0 && selectedUserIds.size === users.length;
  const isPartiallySelected =
    selectedUserIds.size > 0 && selectedUserIds.size < users.length;

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const debouncedSearch = useDebounce(search, 400);

  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const value = useMemo(
    () => ({
      users,
      isLoading,
      error,
      duplicateSelected,
      deleteSelected,
      searchValue,
      handleSearchChange,

      isEditMode,
      handleToggleEditMode,

      selectedUserIds,
      selectedCount,
      toggleSelection,
      selectAll,
      deselectAll,
      toggleSelectAll,
      isAllSelected,
      isPartiallySelected,
    }),
    [
      users,
      isLoading,
      error,
      duplicateSelected,
      deleteSelected,
      searchValue,
      handleSearchChange,
      isEditMode,
      handleToggleEditMode,
      selectedUserIds,
      selectedCount,
      toggleSelection,
      selectAll,
      deselectAll,
      toggleSelectAll,
      isAllSelected,
      isPartiallySelected,
    ],
  );

  return (
    <GithubUsersContext.Provider value={value}>
      {children}
    </GithubUsersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGithubUsersContext() {
  const context = useContext(GithubUsersContext);
  if (!context) {
    throw new Error(
      "useGithubUsers must be used within a GithubUsersContextProvider",
    );
  }
  return context;
}
