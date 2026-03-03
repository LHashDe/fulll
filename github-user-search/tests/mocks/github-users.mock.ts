import type { GithubUser } from '../../services/github/github-user'
import type { DisplayUser } from '../../src/hooks/github-users/use-github-users'

export const mockGithubUser: GithubUser = {
  login: 'testuser',
  id: 12345,
  node_id: 'MDQ6VXNlcjEyMzQ1',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
  gravatar_id: '',
  url: 'https://api.github.com/users/testuser',
  html_url: 'https://github.com/testuser',
  followers_url: 'https://api.github.com/users/testuser/followers',
  following_url: 'https://api.github.com/users/testuser/following{/other_user}',
  gists_url: 'https://api.github.com/users/testuser/gists{/gist_id}',
  starred_url: 'https://api.github.com/users/testuser/starred{/owner}{/repo}',
  subscriptions_url: 'https://api.github.com/users/testuser/subscriptions',
  organizations_url: 'https://api.github.com/users/testuser/orgs',
  repos_url: 'https://api.github.com/users/testuser/repos',
  events_url: 'https://api.github.com/users/testuser/events{/privacy}',
  received_events_url: 'https://api.github.com/users/testuser/received_events',
  type: 'User',
  user_view_type: 'public',
  site_admin: false,
  score: 1,
}

export const mockGithubUser2: GithubUser = {
  ...mockGithubUser,
  login: 'anotheruser',
  id: 67890,
  node_id: 'MDQ6VXNlcjY3ODkw',
  avatar_url: 'https://avatars.githubusercontent.com/u/67890?v=4',
  url: 'https://api.github.com/users/anotheruser',
  html_url: 'https://github.com/anotheruser',
}

export const mockGithubUser3: GithubUser = {
  ...mockGithubUser,
  login: 'thirduser',
  id: 11111,
  node_id: 'MDQ6VXNlcjExMTEx',
  avatar_url: 'https://avatars.githubusercontent.com/u/11111?v=4',
  url: 'https://api.github.com/users/thirduser',
  html_url: 'https://github.com/thirduser',
}

export const createDisplayUser = (user: GithubUser, internalId?: string): DisplayUser => ({
  ...user,
  internalId: internalId || crypto.randomUUID(),
})

export const mockDisplayUser: DisplayUser = createDisplayUser(mockGithubUser, 'test-internal-id-1')
export const mockDisplayUser2: DisplayUser = createDisplayUser(mockGithubUser2, 'test-internal-id-2')
export const mockDisplayUser3: DisplayUser = createDisplayUser(mockGithubUser3, 'test-internal-id-3')

export const mockSearchResponse = {
  total_count: 2,
  incomplete_results: false,
  items: [mockGithubUser, mockGithubUser2],
}

export const mockEmptySearchResponse = {
  total_count: 0,
  incomplete_results: false,
  items: [],
}

export const mockRateLimitError = {
  message: 'API rate limit exceeded',
  status: 403,
}

export const mockNotFoundError = {
  message: 'Not Found',
  status: 404,
}
