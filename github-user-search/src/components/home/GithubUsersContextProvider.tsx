import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ChangeEvent,
} from "react";
import {
  useGithubUsers,
  type DisplayUser,
} from "../../hooks/github-users/use-github-users";
import { useDebounce } from "../../hooks/use-debounce";
import { useSelection } from "../../hooks/github-users/use-selection";

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

const GithubUsersContext = createContext<GithubUsersContextValue | null>(null);

//context provider for the github users
export default function GithubUsersContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const resetSelectionRef = useRef<() => void>(() => {});

  const {
    users,
    error,
    isLoading,
    search,
    duplicateUsers,
    deleteUsers,
  } = useGithubUsers({
    onSearchStart: () => resetSelectionRef.current(),
  });

  const {
    selectedIds: selectedUserIds,
    selectedCount,
    isAllSelected,
    isPartiallySelected,
    toggleSelection,
    selectAll,
    deselectAll,
    toggleSelectAll,
    reset: resetSelection,
  } = useSelection(users);

  useEffect(() => {
    resetSelectionRef.current = resetSelection;
  }, [resetSelection]);

  const duplicateSelected = useCallback(() => {
    duplicateUsers(selectedUserIds);
    resetSelection();
  }, [duplicateUsers, selectedUserIds, resetSelection]);

  const deleteSelected = useCallback(() => {
    deleteUsers(selectedUserIds);
    resetSelection();
  }, [deleteUsers, selectedUserIds, resetSelection]);

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
