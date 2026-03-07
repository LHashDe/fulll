# /public/icons

Icons for edit/duplicate/delete users

# /src

- /hooks: custom hooks
    - use-debounce: hook to prevent spamming requests
    - use-github-users: hook for managing GitHub users
    - use-selection: hook for selecting GitHub users

- /services: list of API requests

- /components: folder for components
    - UserCard: card to display users
    - UsersCardsList: list of cards
    - Toolbar: buttons for edit/duplicate/delete users
    - InputSearch: input for searching users using use-debounce
    - GithubUsersContextProvider: context provider that manages global state (search, selection, edit mode)
    - GithubUsersContextLayout: layout component that renders search input, toolbar, and users list