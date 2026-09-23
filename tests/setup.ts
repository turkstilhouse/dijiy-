import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// `server-only` throws outside a React Server environment; tests run in Node.
vi.mock("server-only", () => ({}));
