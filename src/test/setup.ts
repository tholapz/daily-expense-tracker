import '@testing-library/jest-dom'

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
  },
  firestore: {
    collection: vi.fn(),
    doc: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
  },
  googleProvider: {},
}))

// Mock React Query
const mockInvalidateQueries = vi.fn()
const mockSetQueryData = vi.fn()
const mockGetQueryData = vi.fn()
const mockCancelQueries = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
      setQueryData: mockSetQueryData,
      getQueryData: mockGetQueryData,
      cancelQueries: mockCancelQueries,
    }),
    QueryClient: vi.fn(() => ({
      invalidateQueries: mockInvalidateQueries,
      setQueryData: mockSetQueryData,
      getQueryData: mockGetQueryData,
      cancelQueries: mockCancelQueries,
    })),
    QueryClientProvider: ({ children }: any) => children,
  }
})

export { mockInvalidateQueries, mockSetQueryData, mockGetQueryData, mockCancelQueries }