import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, Link, useNavigate, useLocation, useParams } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { create } from "zustand";
import { useEffect, useState, useCallback, useRef, createContext, useContext } from "react";
import { Sun, Moon, FileText, Target, TrendingUp, Calendar } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useDropzone } from "react-dropzone";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const getPuter = () => typeof window !== "undefined" && window.puter ? window.puter : null;
const usePuterStore = create((set, get) => {
  const setError = (msg) => {
    set({
      error: msg,
      isLoading: false,
      auth: {
        user: null,
        isAuthenticated: false,
        signIn: get().auth.signIn,
        signOut: get().auth.signOut,
        refreshUser: get().auth.refreshUser,
        checkAuthStatus: get().auth.checkAuthStatus,
        getUser: get().auth.getUser
      }
    });
  };
  const checkAuthStatus = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      const isSignedIn = await puter.auth.isSignedIn();
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        set({
          auth: {
            user,
            isAuthenticated: true,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => user
          },
          isLoading: false
        });
        return true;
      } else {
        set({
          auth: {
            user: null,
            isAuthenticated: false,
            signIn: get().auth.signIn,
            signOut: get().auth.signOut,
            refreshUser: get().auth.refreshUser,
            checkAuthStatus: get().auth.checkAuthStatus,
            getUser: () => null
          },
          isLoading: false
        });
        return false;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to check auth status";
      setError(msg);
      return false;
    }
  };
  const signIn = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    }
  };
  const signOut = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await puter.auth.signOut();
      set({
        auth: {
          user: null,
          isAuthenticated: false,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => null
        },
        isLoading: false
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign out failed";
      setError(msg);
    }
  };
  const refreshUser = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const user = await puter.auth.getUser();
      set({
        auth: {
          user,
          isAuthenticated: true,
          signIn: get().auth.signIn,
          signOut: get().auth.signOut,
          refreshUser: get().auth.refreshUser,
          checkAuthStatus: get().auth.checkAuthStatus,
          getUser: () => user
        },
        isLoading: false
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to refresh user";
      setError(msg);
    }
  };
  const init = () => {
    const puter = getPuter();
    if (puter) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }
    const interval = setInterval(() => {
      if (getPuter()) {
        clearInterval(interval);
        set({ puterReady: true });
        checkAuthStatus();
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      if (!getPuter()) {
        setError("Puter.js failed to load within 10 seconds");
      }
    }, 1e4);
  };
  const write = async (path, data) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.write(path, data);
  };
  const readDir = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.readdir(path);
  };
  const readFile = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.read(path);
  };
  const upload2 = async (files) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.upload(files);
  };
  const deleteFile = async (path) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.fs.delete(path);
  };
  const chat2 = async (prompt, imageURL, testMode, options) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.chat(prompt, imageURL, testMode, options);
  };
  const feedback = async (path, message) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.chat(
      [
        {
          role: "user",
          content: [
            {
              type: "file",
              puter_path: path
            },
            {
              type: "text",
              text: message
            }
          ]
        }
      ],
      { model: "claude-3-7-sonnet" }
    );
  };
  const img2txt = async (image, testMode) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.ai.img2txt(image, testMode);
  };
  const getKV = async (key) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.get(key);
  };
  const setKV = async (key, value) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.set(key, value);
  };
  const deleteKV = async (key) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.delete(key);
  };
  const listKV = async (pattern, returnValues) => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    if (returnValues === void 0) {
      returnValues = false;
    }
    return puter.kv.list(pattern, returnValues);
  };
  const flushKV = async () => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    return puter.kv.flush();
  };
  return {
    isLoading: true,
    error: null,
    puterReady: false,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user
    },
    fs: {
      write: (path, data) => write(path, data),
      read: (path) => readFile(path),
      readDir: (path) => readDir(path),
      upload: (files) => upload2(files),
      delete: (path) => deleteFile(path)
    },
    ai: {
      chat: (prompt, imageURL, testMode, options) => chat2(prompt, imageURL, testMode, options),
      feedback: (path, message) => feedback(path, message),
      img2txt: (image, testMode) => img2txt(image, testMode)
    },
    kv: {
      get: (key) => getKV(key),
      set: (key, value) => setKV(key, value),
      delete: (key) => deleteKV(key),
      list: (pattern, returnValues) => listKV(pattern, returnValues),
      flush: () => flushKV()
    },
    init,
    clearError: () => set({ error: null })
  };
});
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  const {
    init
  } = usePuterStore();
  useEffect(() => {
    init();
  }, [init]);
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [/* @__PURE__ */ jsx("script", {
        src: "https://js.puter.com/v2/"
      }), children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || !savedTheme && prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick: toggleTheme,
      className: "p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200",
      "aria-label": "Toggle theme",
      children: isDark ? /* @__PURE__ */ jsx(Sun, { className: "w-5 h-5 text-yellow-500" }) : /* @__PURE__ */ jsx(Moon, { className: "w-5 h-5 text-gray-600" })
    }
  );
};
const Navbar = () => {
  return /* @__PURE__ */ jsxs("nav", { className: "navbar", children: [
    /* @__PURE__ */ jsx(Link, { to: "/", children: /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gradient", children: "ResumèIQ" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
      /* @__PURE__ */ jsx(ThemeToggle, {}),
      /* @__PURE__ */ jsx(Link, { to: "/upload", className: "primary-button w-fit", children: "Upload Resume" })
    ] })
  ] });
};
const ScoreCircle = ({ score = 75 }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = score / 100;
  const strokeDashoffset = circumference * (1 - progress);
  return /* @__PURE__ */ jsxs("div", { className: "relative w-[100px] h-[100px]", children: [
    /* @__PURE__ */ jsxs(
      "svg",
      {
        height: "100%",
        width: "100%",
        viewBox: "0 0 100 100",
        className: "transform -rotate-90",
        children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "50",
              cy: "50",
              r: normalizedRadius,
              stroke: "#e5e7eb",
              strokeWidth: stroke,
              fill: "transparent"
            }
          ),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "grad", x1: "1", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#FF97AD" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#5171FF" })
          ] }) }),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "50",
              cy: "50",
              r: normalizedRadius,
              stroke: "url(#grad)",
              strokeWidth: stroke,
              fill: "transparent",
              strokeDasharray: circumference,
              strokeDashoffset,
              strokeLinecap: "round"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: `${score}/100` }) })
  ] });
};
const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");
  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    };
    loadResume();
  }, [imagePath]);
  return /* @__PURE__ */ jsxs(Link, { to: `/resume/${id}`, className: "resume-card animate-in fade-in duration-1000", children: [
    /* @__PURE__ */ jsxs("div", { className: "resume-card-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        companyName && /* @__PURE__ */ jsx("h2", { className: "!text-black font-bold break-words", children: companyName }),
        jobTitle && /* @__PURE__ */ jsx("h3", { className: "text-lg break-words text-gray-500", children: jobTitle }),
        !companyName && !jobTitle && /* @__PURE__ */ jsx("h2", { className: "!text-black font-bold", children: "Resume" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsx(ScoreCircle, { score: feedback.overallScore }) })
    ] }),
    resumeUrl && /* @__PURE__ */ jsx("div", { className: "gradient-border animate-in fade-in duration-1000", children: /* @__PURE__ */ jsx("div", { className: "w-full h-full", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: resumeUrl,
        alt: "resume",
        className: "w-full h-[350px] max-sm:h-[200px] object-cover object-top"
      }
    ) }) })
  ] });
};
const Dashboard = () => {
  var _a, _b, _c, _d, _e;
  const { kv } = usePuterStore();
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageScore: 0,
    improvementRate: 0,
    lastAnalyzed: "Never"
  });
  const [skillsData, setSkillsData] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [resumes, setResumes] = useState([]);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      const resumeData = await kv.list("resume:*", true);
      const parsedResumes = (resumeData == null ? void 0 : resumeData.map((resume2) => JSON.parse(resume2.value))) || [];
      setResumes(parsedResumes);
      const totalResumes = parsedResumes.length;
      const averageScore = totalResumes > 0 ? Math.round(parsedResumes.reduce((sum, resume2) => sum + resume2.feedback.overallScore, 0) / totalResumes) : 0;
      const improvementRate = totalResumes > 1 ? parsedResumes[parsedResumes.length - 1].feedback.overallScore - parsedResumes[0].feedback.overallScore : 0;
      const lastAnalyzed = totalResumes > 0 ? (/* @__PURE__ */ new Date()).toLocaleDateString() : "Never";
      setStats({
        totalResumes,
        averageScore,
        improvementRate,
        lastAnalyzed
      });
      const mockSkillsData = [
        { name: "JavaScript", count: 8, color: "#8884d8" },
        { name: "React", count: 6, color: "#82ca9d" },
        { name: "Python", count: 4, color: "#ffc658" },
        { name: "Node.js", count: 5, color: "#ff7300" },
        { name: "SQL", count: 3, color: "#00ff88" }
      ];
      setSkillsData(mockSkillsData);
      const mockScoreHistory = parsedResumes.map((resume2, index) => ({
        date: `Resume ${index + 1}`,
        score: resume2.feedback.overallScore
      }));
      setScoreHistory(mockScoreHistory);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };
  const StatCard = ({ icon: Icon, title, value, subtitle, trend }) => /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-600 dark:text-gray-400", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white mt-1", children: value }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 mt-1", children: subtitle })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `p-3 rounded-lg ${trend === "up" ? "bg-green-100 dark:bg-green-900" : trend === "down" ? "bg-red-100 dark:bg-red-900" : "bg-blue-100 dark:bg-blue-900"}`, children: /* @__PURE__ */ jsx(Icon, { className: `w-6 h-6 ${trend === "up" ? "text-green-600 dark:text-green-400" : trend === "down" ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}` }) })
  ] }) });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: FileText,
          title: "Total Resumes",
          value: stats.totalResumes,
          subtitle: "Analyzed resumes",
          trend: "neutral"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: Target,
          title: "Average Score",
          value: `${stats.averageScore}/100`,
          subtitle: "Overall performance",
          trend: stats.averageScore > 70 ? "up" : stats.averageScore > 50 ? "neutral" : "down"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: TrendingUp,
          title: "Improvement",
          value: stats.improvementRate > 0 ? `+${stats.improvementRate}` : stats.improvementRate,
          subtitle: "Points gained",
          trend: stats.improvementRate > 0 ? "up" : stats.improvementRate < 0 ? "down" : "neutral"
        }
      ),
      /* @__PURE__ */ jsx(
        StatCard,
        {
          icon: Calendar,
          title: "Last Analysis",
          value: stats.lastAnalyzed,
          subtitle: "Most recent",
          trend: "neutral"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Score Progress" }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(LineChart, { data: scoreHistory, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", className: "opacity-30" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "date", className: "text-sm" }),
          /* @__PURE__ */ jsx(YAxis, { domain: [0, 100], className: "text-sm" }),
          /* @__PURE__ */ jsx(
            Tooltip,
            {
              contentStyle: {
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #e5e7eb",
                borderRadius: "8px"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            Line,
            {
              type: "monotone",
              dataKey: "score",
              stroke: "#8884d8",
              strokeWidth: 3,
              dot: { fill: "#8884d8", strokeWidth: 2, r: 4 }
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Skills Distribution" }),
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(
            Pie,
            {
              data: skillsData,
              cx: "50%",
              cy: "50%",
              labelLine: false,
              label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
              outerRadius: 80,
              fill: "#8884d8",
              dataKey: "count",
              children: skillsData.map((entry2, index) => /* @__PURE__ */ jsx(Cell, { fill: entry2.color }, `cell-${index}`))
            }
          ),
          /* @__PURE__ */ jsx(Tooltip, {})
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "Category Performance" }),
      /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxs(BarChart, { data: resumes.length > 0 ? [{
        name: "Latest Resume",
        "Tone & Style": ((_a = resumes[resumes.length - 1]) == null ? void 0 : _a.feedback.toneAndStyle.score) || 0,
        "Content": ((_b = resumes[resumes.length - 1]) == null ? void 0 : _b.feedback.content.score) || 0,
        "Structure": ((_c = resumes[resumes.length - 1]) == null ? void 0 : _c.feedback.structure.score) || 0,
        "Skills": ((_d = resumes[resumes.length - 1]) == null ? void 0 : _d.feedback.skills.score) || 0,
        "ATS": ((_e = resumes[resumes.length - 1]) == null ? void 0 : _e.feedback.ATS.score) || 0
      }] : [], children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", className: "opacity-30" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "name" }),
        /* @__PURE__ */ jsx(YAxis, { domain: [0, 100] }),
        /* @__PURE__ */ jsx(Tooltip, {}),
        /* @__PURE__ */ jsx(Bar, { dataKey: "Tone & Style", fill: "#8884d8" }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "Content", fill: "#82ca9d" }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "Structure", fill: "#ffc658" }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "Skills", fill: "#ff7300" }),
        /* @__PURE__ */ jsx(Bar, { dataKey: "ATS", fill: "#00ff88" })
      ] }) })
    ] })
  ] });
};
function meta$4({}) {
  return [{
    title: "ResumèIQ"
  }, {
    name: "description",
    content: "A Smart feedback from ResumèIQ-AI for your rèsumè!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  const {
    auth: auth2,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  useEffect(() => {
    if (!auth2.isAuthenticated) navigate("/auth?next=/");
  }, [auth2.isAuthenticated]);
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes2 = await kv.list("resume:*", true);
      const parsedResumes = resumes2 == null ? void 0 : resumes2.map((resume2) => JSON.parse(resume2.value));
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  }, []);
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main.svg')] bg-cover",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsxs("section", {
      className: "main-section",
      children: [resumes.length > 0 && /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-[1850px] mb-12",
        children: [/* @__PURE__ */ jsx("h2", {
          className: "text-3xl font-bold text-gray-900 dark:text-white mb-8",
          children: "Dashboard"
        }), /* @__PURE__ */ jsx(Dashboard, {})]
      }), /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-[1850px]",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "page-heading py-16",
          children: [/* @__PURE__ */ jsx("h1", {
            children: "Track Your Applications & Resume Ratings"
          }), !loadingResumes && (resumes == null ? void 0 : resumes.length) === 0 ? /* @__PURE__ */ jsx("h2", {
            children: "No resumes found. Upload your first resume to get feedback."
          }) : /* @__PURE__ */ jsx("h2", {
            children: "Review your submissions and check AI-powered feedback."
          })]
        }), loadingResumes && /* @__PURE__ */ jsx("div", {
          className: "flex flex-col items-center justify-center",
          children: /* @__PURE__ */ jsx("img", {
            src: "/images/resume-scan-2.gif",
            className: "w-[200px]"
          })
        }), !loadingResumes && resumes.length > 0 && /* @__PURE__ */ jsx("div", {
          className: "resumes-section",
          children: resumes.map((resume2) => /* @__PURE__ */ jsx(ResumeCard, {
            resume: resume2
          }, resume2.id))
        }), !loadingResumes && (resumes == null ? void 0 : resumes.length) === 0 && /* @__PURE__ */ jsx("div", {
          className: "flex flex-col items-center justify-center mt-10 gap-4",
          children: /* @__PURE__ */ jsx(Link, {
            to: "/upload",
            className: "primary-button w-fit text-xl font-semibold",
            children: "Upload Resume"
          })
        })]
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta: meta$4
}, Symbol.toStringTag, { value: "Module" }));
const meta$3 = () => [{
  title: "Resumind | Auth"
}, {
  name: "description",
  content: "Log into your account"
}];
const Auth = () => {
  const {
    isLoading,
    auth: auth2
  } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();
  useEffect(() => {
    if (auth2.isAuthenticated) navigate(next);
  }, [auth2.isAuthenticated, next]);
  return /* @__PURE__ */ jsx("main", {
    className: "bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center",
    children: /* @__PURE__ */ jsx("div", {
      className: "gradient-border shadow-lg",
      children: /* @__PURE__ */ jsxs("section", {
        className: "flex flex-col gap-8 bg-white rounded-2xl p-10",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "flex flex-col items-center gap-2 text-center",
          children: [/* @__PURE__ */ jsx("h1", {
            children: "Welcome"
          }), /* @__PURE__ */ jsx("h2", {
            children: "Log In to Continue Your Job Journey"
          })]
        }), /* @__PURE__ */ jsx("div", {
          children: isLoading ? /* @__PURE__ */ jsx("button", {
            className: "auth-button animate-pulse",
            children: /* @__PURE__ */ jsx("p", {
              children: "Signing you in..."
            })
          }) : /* @__PURE__ */ jsx(Fragment, {
            children: auth2.isAuthenticated ? /* @__PURE__ */ jsx("button", {
              className: "auth-button",
              onClick: auth2.signOut,
              children: /* @__PURE__ */ jsx("p", {
                children: "Log Out"
              })
            }) : /* @__PURE__ */ jsx("button", {
              className: "auth-button",
              onClick: auth2.signIn,
              children: /* @__PURE__ */ jsx("p", {
                children: "Log In"
              })
            })
          })
        })]
      })
    })
  });
};
const auth = UNSAFE_withComponentProps(Auth);
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: auth,
  meta: meta$3
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function formatSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
const generateUUID = () => crypto.randomUUID();
const FileUploader = ({ onFileSelect, onProgress, multiple = false }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const onDrop = useCallback((acceptedFiles2) => {
    if (multiple) {
      onFileSelect == null ? void 0 : onFileSelect(acceptedFiles2[0]);
    } else {
      const file2 = acceptedFiles2[0] || null;
      onFileSelect == null ? void 0 : onFileSelect(file2);
    }
    if (acceptedFiles2.length > 0) {
      setIsUploading(true);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            onProgress == null ? void 0 : onProgress(100);
            return 100;
          }
          const newProgress = prev + 10;
          onProgress == null ? void 0 : onProgress(newProgress);
          return newProgress;
        });
      }, 100);
    }
  }, [onFileSelect]);
  const maxFileSize = 20 * 1024 * 1024;
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    multiple,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
      "application/rtf": [".rtf"],
      "application/vnd.oasis.opendocument.text": [".odt"],
      "text/markdown": [".md"]
    },
    maxSize: maxFileSize
  });
  const file = acceptedFiles[0] || null;
  return /* @__PURE__ */ jsx("div", { className: "w-full gradient-border", children: /* @__PURE__ */ jsxs("div", { ...getRootProps(), children: [
    /* @__PURE__ */ jsx("input", { ...getInputProps() }),
    /* @__PURE__ */ jsx("div", { className: "space-y-4 cursor-pointer", children: file ? /* @__PURE__ */ jsxs("div", { className: "uploader-selected-file", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("img", { src: "/images/pdf.png", alt: "pdf", className: "size-10" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-3", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-700 truncate max-w-xs", children: file.name }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: formatSize(file.size) })
      ] }) }),
      /* @__PURE__ */ jsx("button", { className: "p-2 cursor-pointer", onClick: (e) => {
        onFileSelect == null ? void 0 : onFileSelect(null);
      }, children: /* @__PURE__ */ jsx("img", { src: "/icons/cross.svg", alt: "remove", className: "w-4 h-4" }) })
    ] }) : /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto w-16 h-16 flex items-center justify-center mb-2", children: /* @__PURE__ */ jsx("img", { src: "/icons/info.svg", alt: "upload", className: "size-20" }) }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-500", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Click to upload" }),
        " or drag and drop"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-lg text-gray-500", children: [
        "PDF, DOCX, DOC, TXT, RTF, ODT, MD (max ",
        formatSize(maxFileSize),
        ")"
      ] }),
      isUploading && /* @__PURE__ */ jsxs("div", { className: "mt-4 w-full", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm text-gray-600 mb-1", children: [
          /* @__PURE__ */ jsx("span", { children: "Uploading..." }),
          /* @__PURE__ */ jsxs("span", { children: [
            uploadProgress,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "bg-blue-600 h-2 rounded-full transition-all duration-300",
            style: { width: `${uploadProgress}%` }
          }
        ) })
      ] })
    ] }) })
  ] }) });
};
let pdfjsLib = null;
let loadPromise = null;
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    pdfjsLib = lib;
    return lib;
  });
  return loadPromise;
}
async function convertPdfToImage(file) {
  try {
    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 4 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    if (context) {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
    }
    await page.render({ canvasContext: context, viewport }).promise;
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png"
            });
            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob"
            });
          }
        },
        "image/png",
        1
      );
    });
  } catch (err) {
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`
    };
  }
}
const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;
const prepareInstructions = ({ jobTitle, jobDescription }) => `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      Please analyze and rate this resume and suggest how to improve it.
      The rating can be low if the resume is bad.
      Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
      If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their resume.
      If available, use the job description for the job user is applying to to give more detailed feedback.
      If provided, take the job description into consideration.
      The job title is: ${jobTitle}
      The job description is: ${jobDescription}
      
      Additional analysis requirements:
      - Analyze the resume for ATS compatibility (keyword usage, formatting, section headers)
      - Check for grammar and spelling issues
      - Evaluate tone and professional language
      - Assess skill relevance to the job description
      - Review document structure and readability
      - Provide specific, actionable improvement suggestions
      
      Provide the feedback using the following format:
      ${AIResponseFormat}
      Return the analysis as an JSON object, without any other text and without the backticks.
      Do not include any other text or comments.`;
const Upload = () => {
  const {
    auth: auth2,
    isLoading,
    fs,
    ai,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState(null);
  const handleFileSelect = (file2) => {
    setFile(file2);
  };
  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file: file2
  }) => {
    setIsProcessing(true);
    setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file2]);
    if (!uploadedFile) return setStatusText("Error: Failed to upload file");
    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file2);
    if (!imageFile.file) return setStatusText("Error: Failed to convert PDF to image");
    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Error: Failed to upload image");
    setStatusText("Preparing data...");
    const uuid = generateUUID();
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: ""
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analyzing...");
    const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({
      jobTitle,
      jobDescription
    }));
    if (!feedback) return setStatusText("Error: Failed to analyze resume");
    const feedbackText = typeof feedback.message.content === "string" ? feedback.message.content : feedback.message.content[0].text;
    data.feedback = JSON.parse(feedbackText);
    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis complete, redirecting...");
    console.log(data);
    navigate(`/resume/${uuid}`);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name");
    const jobTitle = formData.get("job-title");
    const jobDescription = formData.get("job-description");
    if (!file) return;
    handleAnalyze({
      companyName,
      jobTitle,
      jobDescription,
      file
    });
  };
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main.svg')] bg-cover",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("section", {
      className: "main-section",
      children: /* @__PURE__ */ jsxs("div", {
        className: "page-heading py-16",
        children: [/* @__PURE__ */ jsx("h1", {
          children: "Smart feedback for your dream job"
        }), isProcessing ? /* @__PURE__ */ jsxs(Fragment, {
          children: [/* @__PURE__ */ jsx("h2", {
            children: statusText
          }), /* @__PURE__ */ jsx("img", {
            src: "/images/resume-scan.gif",
            className: "w-full"
          })]
        }) : /* @__PURE__ */ jsx("h2", {
          children: "Drop your resume for an ATS score and improvement tips"
        }), !isProcessing && /* @__PURE__ */ jsxs("form", {
          id: "upload-form",
          onSubmit: handleSubmit,
          className: "flex flex-col gap-4 mt-8",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "company-name",
              children: "Company Name"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              name: "company-name",
              placeholder: "Company Name",
              id: "company-name"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "job-title",
              children: "Job Title"
            }), /* @__PURE__ */ jsx("input", {
              type: "text",
              name: "job-title",
              placeholder: "Job Title",
              id: "job-title"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "job-description",
              children: "Job Description"
            }), /* @__PURE__ */ jsx("textarea", {
              rows: 5,
              name: "job-description",
              placeholder: "Job Description",
              id: "job-description"
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "form-div",
            children: [/* @__PURE__ */ jsx("label", {
              htmlFor: "uploader",
              children: "Upload Resume"
            }), /* @__PURE__ */ jsx(FileUploader, {
              onFileSelect: handleFileSelect
            })]
          }), /* @__PURE__ */ jsx("button", {
            className: "primary-button",
            type: "submit",
            children: "Analyze Resume"
          })]
        })]
      })
    })]
  });
};
const upload = UNSAFE_withComponentProps(Upload);
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: upload
}, Symbol.toStringTag, { value: "Module" }));
const ScoreGauge = ({ score = 75 }) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef(null);
  const percentage = score / 100;
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center", children: /* @__PURE__ */ jsxs("div", { className: "relative w-40 h-20", children: [
    /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 50", className: "w-full h-full", children: [
      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs(
        "linearGradient",
        {
          id: "gaugeGradient",
          x1: "0%",
          y1: "0%",
          x2: "100%",
          y2: "0%",
          children: [
            /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "#a78bfa" }),
            /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "#fca5a5" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M10,50 A40,40 0 0,1 90,50",
          fill: "none",
          stroke: "#e5e7eb",
          strokeWidth: "10",
          strokeLinecap: "round"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          ref: pathRef,
          d: "M10,50 A40,40 0 0,1 90,50",
          fill: "none",
          stroke: "url(#gaugeGradient)",
          strokeWidth: "10",
          strokeLinecap: "round",
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength * (1 - percentage)
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center pt-2", children: /* @__PURE__ */ jsxs("div", { className: "text-xl font-semibold pt-4", children: [
      score,
      "/100"
    ] }) })
  ] }) });
};
const ScoreBadge$1 = ({ score }) => {
  let badgeColor = "";
  let badgeText = "";
  if (score > 70) {
    badgeColor = "bg-badge-green text-green-600";
    badgeText = "Strong";
  } else if (score > 49) {
    badgeColor = "bg-badge-yellow text-yellow-600";
    badgeText = "Good Start";
  } else {
    badgeColor = "bg-badge-red text-red-600";
    badgeText = "Needs Work";
  }
  return /* @__PURE__ */ jsx("div", { className: `px-3 py-1 rounded-full ${badgeColor}`, children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: badgeText }) });
};
const Category = ({ title, score }) => {
  const textColor = score > 70 ? "text-green-600" : score > 49 ? "text-yellow-600" : "text-red-600";
  return /* @__PURE__ */ jsx("div", { className: "resume-summary", children: /* @__PURE__ */ jsxs("div", { className: "category", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-2 items-center justify-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-2xl", children: title }),
      /* @__PURE__ */ jsx(ScoreBadge$1, { score })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-2xl", children: [
      /* @__PURE__ */ jsx("span", { className: textColor, children: score }),
      "/100"
    ] })
  ] }) });
};
const Summary = ({ feedback }) => {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-2xl shadow-md w-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-row items-center p-4 gap-8", children: [
      /* @__PURE__ */ jsx(ScoreGauge, { score: feedback.overallScore }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Your Resume Score" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "This score is calculated based on the variables listed below." })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Category, { title: "Tone & Style", score: feedback.toneAndStyle.score }),
    /* @__PURE__ */ jsx(Category, { title: "Content", score: feedback.content.score }),
    /* @__PURE__ */ jsx(Category, { title: "Structure", score: feedback.structure.score }),
    /* @__PURE__ */ jsx(Category, { title: "Skills", score: feedback.skills.score })
  ] });
};
const ATS = ({ score, suggestions }) => {
  const gradientClass = score > 69 ? "from-green-100" : score > 49 ? "from-yellow-100" : "from-red-100";
  const iconSrc = score > 69 ? "/icons/ats-good.svg" : score > 49 ? "/icons/ats-warning.svg" : "/icons/ats-bad.svg";
  const subtitle = score > 69 ? "Great Job!" : score > 49 ? "Good Start" : "Needs Improvement";
  return /* @__PURE__ */ jsxs("div", { className: `bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full p-6`, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsx("img", { src: iconSrc, alt: "ATS Score Icon", className: "w-12 h-12" }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold", children: [
        "ATS Score - ",
        score,
        "/100"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mb-2", children: subtitle }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-4", children: "This score represents how well your resume is likely to perform in Applicant Tracking Systems used by employers." }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: suggestions.map((suggestion, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: suggestion.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
            alt: suggestion.type === "good" ? "Check" : "Warning",
            className: "w-5 h-5 mt-1"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: suggestion.type === "good" ? "text-green-700" : "text-amber-700", children: suggestion.tip })
      ] }, index)) })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-gray-700 italic", children: "Keep refining your resume to improve your chances of getting past ATS filters and into the hands of recruiters." })
  ] });
};
const AccordionContext = createContext(
  void 0
);
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("Accordion components must be used within an Accordion");
  }
  return context;
};
const Accordion = ({
  children,
  defaultOpen,
  allowMultiple = false,
  className = ""
}) => {
  const [activeItems, setActiveItems] = useState(
    defaultOpen ? [defaultOpen] : []
  );
  const toggleItem = (id) => {
    setActiveItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      } else {
        return prev.includes(id) ? [] : [id];
      }
    });
  };
  const isItemActive = (id) => activeItems.includes(id);
  return /* @__PURE__ */ jsx(
    AccordionContext.Provider,
    {
      value: { activeItems, toggleItem, isItemActive },
      children: /* @__PURE__ */ jsx("div", { className: `space-y-2 ${className}`, children })
    }
  );
};
const AccordionItem = ({
  id,
  children,
  className = ""
}) => {
  return /* @__PURE__ */ jsx("div", { className: `overflow-hidden border-b border-gray-200 ${className}`, children });
};
const AccordionHeader = ({
  itemId,
  children,
  className = "",
  icon,
  iconPosition = "right"
}) => {
  const { toggleItem, isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  const defaultIcon = /* @__PURE__ */ jsx(
    "svg",
    {
      className: cn("w-5 h-5 transition-transform duration-200", {
        "rotate-180": isActive
      }),
      fill: "none",
      stroke: "#98A2B3",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
      children: /* @__PURE__ */ jsx(
        "path",
        {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: 2,
          d: "M19 9l-7 7-7-7"
        }
      )
    }
  );
  const handleClick = () => {
    toggleItem(itemId);
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: handleClick,
      className: `
        w-full px-4 py-3 text-left
        focus:outline-none
        transition-colors duration-200 flex items-center justify-between cursor-pointer
        ${className}
      `,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          iconPosition === "left" && (icon || defaultIcon),
          /* @__PURE__ */ jsx("div", { className: "flex-1", children })
        ] }),
        iconPosition === "right" && (icon || defaultIcon)
      ]
    }
  );
};
const AccordionContent = ({
  itemId,
  children,
  className = ""
}) => {
  const { isItemActive } = useAccordion();
  const isActive = isItemActive(itemId);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `
        overflow-hidden transition-all duration-300 ease-in-out
        ${isActive ? "max-h-fit opacity-100" : "max-h-0 opacity-0"}
        ${className}
      `,
      children: /* @__PURE__ */ jsx("div", { className: "px-4 py-3 ", children })
    }
  );
};
const ScoreBadge = ({ score }) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex flex-row gap-1 items-center px-2 py-0.5 rounded-[96px]",
        score > 69 ? "bg-badge-green" : score > 39 ? "bg-badge-yellow" : "bg-badge-red"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: score > 69 ? "/icons/check.svg" : "/icons/warning.svg",
            alt: "score",
            className: "size-4"
          }
        ),
        /* @__PURE__ */ jsxs(
          "p",
          {
            className: cn(
              "text-sm font-medium",
              score > 69 ? "text-badge-green-text" : score > 39 ? "text-badge-yellow-text" : "text-badge-red-text"
            ),
            children: [
              score,
              "/100"
            ]
          }
        )
      ]
    }
  );
};
const CategoryHeader = ({
  title,
  categoryScore
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-4 items-center py-2", children: [
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold", children: title }),
    /* @__PURE__ */ jsx(ScoreBadge, { score: categoryScore })
  ] });
};
const CategoryContent = ({
  tips
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 items-center w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "bg-gray-50 w-full rounded-lg px-5 py-4 grid grid-cols-2 gap-4", children: tips.map((tip, index) => /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-2 items-center", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
          alt: "score",
          className: "size-5"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-xl text-gray-500 ", children: tip.tip })
    ] }, index)) }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 w-full", children: tips.map((tip, index) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex flex-col gap-2 rounded-2xl p-4",
          tip.type === "good" ? "bg-green-50 border border-green-200 text-green-700" : "bg-yellow-50 border border-yellow-200 text-yellow-700"
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-row gap-2 items-center", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: tip.type === "good" ? "/icons/check.svg" : "/icons/warning.svg",
                alt: "score",
                className: "size-5"
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: tip.tip })
          ] }),
          /* @__PURE__ */ jsx("p", { children: tip.explanation })
        ]
      },
      index + tip.tip
    )) })
  ] });
};
const Details = ({ feedback }) => {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4 w-full", children: /* @__PURE__ */ jsxs(Accordion, { children: [
    /* @__PURE__ */ jsxs(AccordionItem, { id: "tone-style", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "tone-style", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Tone & Style",
          categoryScore: feedback.toneAndStyle.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "tone-style", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.toneAndStyle.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "content", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "content", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Content",
          categoryScore: feedback.content.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "content", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.content.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "structure", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "structure", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Structure",
          categoryScore: feedback.structure.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "structure", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.structure.tips }) })
    ] }),
    /* @__PURE__ */ jsxs(AccordionItem, { id: "skills", children: [
      /* @__PURE__ */ jsx(AccordionHeader, { itemId: "skills", children: /* @__PURE__ */ jsx(
        CategoryHeader,
        {
          title: "Skills",
          categoryScore: feedback.skills.score
        }
      ) }),
      /* @__PURE__ */ jsx(AccordionContent, { itemId: "skills", children: /* @__PURE__ */ jsx(CategoryContent, { tips: feedback.skills.tips }) })
    ] })
  ] }) });
};
const meta$2 = () => [{
  title: "Resumind | Review "
}, {
  name: "description",
  content: "Detailed overview of your resume"
}];
const Resume = () => {
  const {
    auth: auth2,
    isLoading,
    fs,
    kv
  } = usePuterStore();
  const {
    id
  } = useParams();
  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !auth2.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);
  useEffect(() => {
    const loadResume = async () => {
      const resume2 = await kv.get(`resume:${id}`);
      if (!resume2) return;
      const data = JSON.parse(resume2);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;
      const pdfBlob = new Blob([resumeBlob], {
        type: "application/pdf"
      });
      const resumeUrl2 = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl2);
      const imageBlob = await fs.read(data.imagePath);
      if (!imageBlob) return;
      const imageUrl2 = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl2);
      setFeedback(data.feedback);
      console.log({
        resumeUrl: resumeUrl2,
        imageUrl: imageUrl2,
        feedback: data.feedback
      });
    };
    loadResume();
  }, [id]);
  return /* @__PURE__ */ jsxs("main", {
    className: "!pt-0",
    children: [/* @__PURE__ */ jsx("nav", {
      className: "resume-nav",
      children: /* @__PURE__ */ jsxs(Link, {
        to: "/",
        className: "back-button",
        children: [/* @__PURE__ */ jsx("img", {
          src: "/icons/back.svg",
          alt: "logo",
          className: "w-2.5 h-2.5"
        }), /* @__PURE__ */ jsx("span", {
          className: "text-gray-800 text-sm font-semibold",
          children: "Back to Homepage"
        })]
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex flex-col lg:flex-row w-full",
      children: [/* @__PURE__ */ jsx("section", {
        className: "lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:w-1/2 px-4 py-6 lg:px-8 lg:py-8 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white lg:bg-[url('/images/bg-small.svg')] bg-cover",
        children: imageUrl && resumeUrl && /* @__PURE__ */ jsxs("div", {
          className: "w-full max-w-2xl mx-auto",
          children: [/* @__PURE__ */ jsxs("div", {
            className: "relative group",
            children: [/* @__PURE__ */ jsx("div", {
              className: "absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-200 blur-sm"
            }), /* @__PURE__ */ jsx("div", {
              className: "relative bg-white rounded-xl shadow-xl overflow-hidden",
              children: /* @__PURE__ */ jsxs("a", {
                href: resumeUrl,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "block",
                "aria-label": "Open resume in new tab",
                children: [/* @__PURE__ */ jsx("img", {
                  src: imageUrl,
                  className: "w-full h-auto object-contain rounded-xl border border-gray-200",
                  alt: "Resume preview",
                  loading: "lazy"
                }), /* @__PURE__ */ jsx("div", {
                  className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-200 opacity-0 group-hover:opacity-100",
                  children: /* @__PURE__ */ jsx("span", {
                    className: "bg-white text-blue-600 font-medium px-4 py-2 rounded-full shadow-lg",
                    children: "View Full Size"
                  })
                })]
              })
            })]
          }), /* @__PURE__ */ jsxs("div", {
            className: "mt-4 text-center text-sm text-gray-500",
            children: [/* @__PURE__ */ jsx("p", {
              children: "Tap on the resume to view full size"
            }), /* @__PURE__ */ jsx("p", {
              className: "text-xs mt-1",
              children: "(Opens in a new tab)"
            })]
          })]
        })
      }), /* @__PURE__ */ jsx("section", {
        className: "lg:w-1/2 px-4 py-6 lg:px-8 lg:py-12 bg-white lg:overflow-y-auto lg:h-screen",
        children: /* @__PURE__ */ jsxs("div", {
          className: "max-w-2xl mx-auto",
          children: [/* @__PURE__ */ jsx("h2", {
            className: "text-3xl md:text-4xl font-bold text-gray-900 mb-8",
            children: "Resume Review"
          }), feedback ? /* @__PURE__ */ jsxs("div", {
            className: "space-y-8 animate-in fade-in duration-1000",
            children: [/* @__PURE__ */ jsx(Summary, {
              feedback
            }), /* @__PURE__ */ jsx(ATS, {
              score: feedback.ATS.score || 0,
              suggestions: feedback.ATS.tips || []
            }), /* @__PURE__ */ jsx(Details, {
              feedback
            })]
          }) : /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col items-center justify-center py-12",
            children: [/* @__PURE__ */ jsx("img", {
              src: "/images/resume-scan-2.gif",
              className: "w-full max-w-md",
              alt: "Analyzing resume...",
              loading: "lazy"
            }), /* @__PURE__ */ jsx("p", {
              className: "mt-4 text-gray-600 text-center",
              children: "Analyzing your resume. Please wait..."
            })]
          })]
        })
      })]
    })]
  });
};
const resume = UNSAFE_withComponentProps(Resume);
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: resume,
  meta: meta$2
}, Symbol.toStringTag, { value: "Module" }));
const ResumeComparison = () => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
  const { kv, fs } = usePuterStore();
  const [resumes, setResumes] = useState([]);
  const [selectedResume1, setSelectedResume1] = useState("");
  const [selectedResume2, setSelectedResume2] = useState("");
  const [comparison2, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeImages, setResumeImages] = useState({});
  useEffect(() => {
    const loadResumes = async () => {
      const resumeData = await kv.list("resume:*", true);
      const parsedResumes = (resumeData == null ? void 0 : resumeData.map((item) => JSON.parse(item.value))) || [];
      setResumes(parsedResumes);
      const images = {};
      for (const resume2 of parsedResumes) {
        try {
          const blob = await fs.read(resume2.imagePath);
          if (blob) {
            images[resume2.id] = URL.createObjectURL(blob);
          }
        } catch (error) {
          console.error(`Error loading image for resume ${resume2.id}:`, error);
        }
      }
      setResumeImages(images);
    };
    loadResumes();
  }, [kv, fs]);
  const handleCompare = async () => {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R;
    if (!selectedResume1 || !selectedResume2) return;
    setLoading(true);
    const resume1 = resumes.find((r) => r.id === selectedResume1);
    const resume2 = resumes.find((r) => r.id === selectedResume2);
    if (!resume1 || !resume2) {
      setLoading(false);
      return;
    }
    const improvements = [
      {
        category: "Overall Score",
        oldScore: ((_a2 = resume1.feedback) == null ? void 0 : _a2.overallScore) || 0,
        newScore: ((_b2 = resume2.feedback) == null ? void 0 : _b2.overallScore) || 0,
        change: (((_c2 = resume2.feedback) == null ? void 0 : _c2.overallScore) || 0) - (((_d2 = resume1.feedback) == null ? void 0 : _d2.overallScore) || 0)
      },
      {
        category: "ATS Score",
        oldScore: ((_f2 = (_e2 = resume1.feedback) == null ? void 0 : _e2.ATS) == null ? void 0 : _f2.score) || 0,
        newScore: ((_h2 = (_g2 = resume2.feedback) == null ? void 0 : _g2.ATS) == null ? void 0 : _h2.score) || 0,
        change: (((_j2 = (_i2 = resume2.feedback) == null ? void 0 : _i2.ATS) == null ? void 0 : _j2.score) || 0) - (((_l = (_k = resume1.feedback) == null ? void 0 : _k.ATS) == null ? void 0 : _l.score) || 0)
      },
      {
        category: "Tone & Style",
        oldScore: ((_n = (_m = resume1.feedback) == null ? void 0 : _m.toneAndStyle) == null ? void 0 : _n.score) || 0,
        newScore: ((_p = (_o = resume2.feedback) == null ? void 0 : _o.toneAndStyle) == null ? void 0 : _p.score) || 0,
        change: (((_r = (_q = resume2.feedback) == null ? void 0 : _q.toneAndStyle) == null ? void 0 : _r.score) || 0) - (((_t = (_s = resume1.feedback) == null ? void 0 : _s.toneAndStyle) == null ? void 0 : _t.score) || 0)
      },
      {
        category: "Content",
        oldScore: ((_v = (_u = resume1.feedback) == null ? void 0 : _u.content) == null ? void 0 : _v.score) || 0,
        newScore: ((_x = (_w = resume2.feedback) == null ? void 0 : _w.content) == null ? void 0 : _x.score) || 0,
        change: (((_z = (_y = resume2.feedback) == null ? void 0 : _y.content) == null ? void 0 : _z.score) || 0) - (((_B = (_A = resume1.feedback) == null ? void 0 : _A.content) == null ? void 0 : _B.score) || 0)
      },
      {
        category: "Structure",
        oldScore: ((_D = (_C = resume1.feedback) == null ? void 0 : _C.structure) == null ? void 0 : _D.score) || 0,
        newScore: ((_F = (_E = resume2.feedback) == null ? void 0 : _E.structure) == null ? void 0 : _F.score) || 0,
        change: (((_H = (_G = resume2.feedback) == null ? void 0 : _G.structure) == null ? void 0 : _H.score) || 0) - (((_J = (_I = resume1.feedback) == null ? void 0 : _I.structure) == null ? void 0 : _J.score) || 0)
      },
      {
        category: "Skills",
        oldScore: ((_L = (_K = resume1.feedback) == null ? void 0 : _K.skills) == null ? void 0 : _L.score) || 0,
        newScore: ((_N = (_M = resume2.feedback) == null ? void 0 : _M.skills) == null ? void 0 : _N.score) || 0,
        change: (((_P = (_O = resume2.feedback) == null ? void 0 : _O.skills) == null ? void 0 : _P.score) || 0) - (((_R = (_Q = resume1.feedback) == null ? void 0 : _Q.skills) == null ? void 0 : _R.score) || 0)
      }
    ];
    setComparison({
      resume1,
      resume2,
      improvements
    });
    setLoading(false);
  };
  const getChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };
  const getChangeIcon = (change) => {
    if (change > 0) {
      return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" }) });
    }
    if (change < 0) {
      return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" }) });
    }
    return /* @__PURE__ */ jsx("svg", { className: "w-4 h-4 text-gray-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 12h14" }) });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-6", children: "Resume Comparison" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "First Resume (Baseline)" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: selectedResume1,
              onChange: (e) => setSelectedResume1(e.target.value),
              className: "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select a resume..." }),
                resumes.map((resume2) => {
                  var _a2;
                  return /* @__PURE__ */ jsxs("option", { value: resume2.id, children: [
                    resume2.companyName || "Resume",
                    " ",
                    resume2.jobTitle && `- ${resume2.jobTitle}`,
                    "(Score: ",
                    ((_a2 = resume2.feedback) == null ? void 0 : _a2.overallScore) || 0,
                    ")"
                  ] }, resume2.id);
                })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Second Resume (Comparison)" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: selectedResume2,
              onChange: (e) => setSelectedResume2(e.target.value),
              className: "w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select a resume..." }),
                resumes.filter((r) => r.id !== selectedResume1).map((resume2) => {
                  var _a2;
                  return /* @__PURE__ */ jsxs("option", { value: resume2.id, children: [
                    resume2.companyName || "Resume",
                    " ",
                    resume2.jobTitle && `- ${resume2.jobTitle}`,
                    "(Score: ",
                    ((_a2 = resume2.feedback) == null ? void 0 : _a2.overallScore) || 0,
                    ")"
                  ] }, resume2.id);
                })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleCompare,
          disabled: !selectedResume1 || !selectedResume2 || loading,
          className: "w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200",
          children: loading ? "Comparing..." : "Compare Resumes"
        }
      )
    ] }),
    comparison2 && /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: ((_a = comparison2.resume1) == null ? void 0 : _a.companyName) || "Resume 1" }),
            /* @__PURE__ */ jsx(ScoreCircle, { score: ((_c = (_b = comparison2.resume1) == null ? void 0 : _b.feedback) == null ? void 0 : _c.overallScore) || 0 })
          ] }),
          resumeImages[((_d = comparison2.resume1) == null ? void 0 : _d.id) || ""] && /* @__PURE__ */ jsx("div", { className: "gradient-border", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: resumeImages[((_e = comparison2.resume1) == null ? void 0 : _e.id) || ""],
              alt: "Resume 1 preview",
              className: "w-full h-64 object-cover object-top rounded-lg"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: ((_f = comparison2.resume2) == null ? void 0 : _f.companyName) || "Resume 2" }),
            /* @__PURE__ */ jsx(ScoreCircle, { score: ((_h = (_g = comparison2.resume2) == null ? void 0 : _g.feedback) == null ? void 0 : _h.overallScore) || 0 })
          ] }),
          resumeImages[((_i = comparison2.resume2) == null ? void 0 : _i.id) || ""] && /* @__PURE__ */ jsx("div", { className: "gradient-border", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: resumeImages[((_j = comparison2.resume2) == null ? void 0 : _j.id) || ""],
              alt: "Resume 2 preview",
              className: "w-full h-64 object-cover object-top rounded-lg"
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-gray-900 dark:text-white mb-6", children: "Score Comparison" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: comparison2.improvements.map((improvement, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-4", children: /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-900 dark:text-white", children: improvement.category }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-600 dark:text-gray-400", children: [
              improvement.oldScore,
              " → ",
              improvement.newScore
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `flex items-center space-x-1 ${getChangeColor(improvement.change)}`, children: [
              getChangeIcon(improvement.change),
              /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                improvement.change > 0 ? "+" : "",
                improvement.change
              ] })
            ] })
          ] })
        ] }, index)) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-blue-900 dark:text-blue-100 mb-2", children: "Summary" }),
          /* @__PURE__ */ jsx("p", { className: "text-blue-800 dark:text-blue-200", children: comparison2.improvements[0].change > 0 ? `Great improvement! Your overall score increased by ${comparison2.improvements[0].change} points.` : comparison2.improvements[0].change < 0 ? `Your overall score decreased by ${Math.abs(comparison2.improvements[0].change)} points. Consider reviewing the feedback.` : "No change in overall score. Both resumes perform similarly." })
        ] })
      ] })
    ] })
  ] });
};
const meta$1 = () => [{
  title: "ResumeIQ | Resume Comparison"
}, {
  name: "description",
  content: "Compare your resumes to track improvements"
}];
const ComparisonPage = () => {
  const {
    auth: auth2,
    isLoading
  } = usePuterStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !auth2.isAuthenticated) {
      navigate("/auth?next=/comparison");
    }
  }, [isLoading, auth2.isAuthenticated, navigate]);
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen flex items-center justify-center",
      children: /* @__PURE__ */ jsx("div", {
        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      })
    });
  }
  if (!auth2.isAuthenticated) {
    return null;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main.svg')] bg-cover min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("section", {
      className: "main-section",
      children: /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-6xl mx-auto",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "page-heading py-16",
          children: [/* @__PURE__ */ jsx("h1", {
            children: "Resume Comparison"
          }), /* @__PURE__ */ jsx("h2", {
            children: "Compare different versions of your resume to track improvements"
          })]
        }), /* @__PURE__ */ jsx(ResumeComparison, {})]
      })
    })]
  });
};
const comparison = UNSAFE_withComponentProps(ComparisonPage);
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: comparison,
  meta: meta$1
}, Symbol.toStringTag, { value: "Module" }));
const AIChat = () => {
  const { ai } = usePuterStore();
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your ResumeIQ AI assistant. I can help you with resume tips, career advice, and answer questions about improving your job applications. What would you like to know?",
      timestamp: /* @__PURE__ */ new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    var _a;
    (_a = messagesEndRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSend = async () => {
    var _a;
    if (!input.trim() || isLoading) return;
    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: /* @__PURE__ */ new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const response = await ai.chat(
        `You are ResumeIQ's AI assistant, an expert in resume writing, career development, and job search strategies. 
        Provide helpful, actionable advice. Keep responses concise but informative.
        
        User question: ${input.trim()}`,
        { model: "claude-3-7-sonnet" }
      );
      if (response) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: typeof response.message.content === "string" ? response.message.content : ((_a = response.message.content[0]) == null ? void 0 : _a.text) || "Sorry, I encountered an error.",
          timestamp: /* @__PURE__ */ new Date()
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: /* @__PURE__ */ new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-md h-[600px] flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
      /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" }) }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-gray-900 dark:text-white", children: "ResumeIQ Assistant" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Ask me anything about resumes and careers" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4", children: [
      messages.map((message) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `flex ${message.role === "user" ? "justify-end" : "justify-start"}`,
          children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: `max-w-[80%] p-3 rounded-2xl ${message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"}`,
              children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap", children: message.content }),
                /* @__PURE__ */ jsx("p", { className: `text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`, children: message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
              ]
            }
          )
        },
        message.id
      )),
      isLoading && /* @__PURE__ */ jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsx("div", { className: "bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-1", children: [
        /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }),
        /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: "0.1s" } }),
        /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: "0.2s" } })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-gray-200 dark:border-gray-700", children: /* @__PURE__ */ jsxs("div", { className: "flex space-x-2", children: [
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder: "Ask me about resume tips, career advice, or job search strategies...",
          className: "flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none",
          rows: 2,
          disabled: isLoading
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: handleSend,
          disabled: !input.trim() || isLoading,
          className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 self-end",
          children: /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) })
        }
      )
    ] }) })
  ] });
};
const meta = () => [{
  title: "ResumeIQ | AI Assistant"
}, {
  name: "description",
  content: "Get personalized career and resume advice from our AI assistant"
}];
const ChatPage = () => {
  const {
    auth: auth2,
    isLoading
  } = usePuterStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoading && !auth2.isAuthenticated) {
      navigate("/auth?next=/chat");
    }
  }, [isLoading, auth2.isAuthenticated, navigate]);
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", {
      className: "min-h-screen flex items-center justify-center",
      children: /* @__PURE__ */ jsx("div", {
        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      })
    });
  }
  if (!auth2.isAuthenticated) {
    return null;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "bg-[url('/images/bg-main.svg')] bg-cover min-h-screen",
    children: [/* @__PURE__ */ jsx(Navbar, {}), /* @__PURE__ */ jsx("section", {
      className: "main-section",
      children: /* @__PURE__ */ jsxs("div", {
        className: "w-full max-w-4xl mx-auto",
        children: [/* @__PURE__ */ jsxs("div", {
          className: "page-heading py-16",
          children: [/* @__PURE__ */ jsx("h1", {
            children: "AI Career Assistant"
          }), /* @__PURE__ */ jsx("h2", {
            children: "Get personalized advice for your resume and career development"
          })]
        }), /* @__PURE__ */ jsx(AIChat, {})]
      })
    })]
  });
};
const chat = UNSAFE_withComponentProps(ChatPage);
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: chat,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const WipeApp = () => {
  var _a;
  const {
    auth: auth2,
    isLoading,
    error,
    clearError,
    fs,
    ai,
    kv
  } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const loadFiles = async () => {
    const files2 = await fs.readDir("./");
    setFiles(files2);
  };
  useEffect(() => {
    loadFiles();
  }, []);
  useEffect(() => {
    if (!isLoading && !auth2.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);
  const handleDelete = async () => {
    files.forEach(async (file) => {
      await fs.delete(file.path);
    });
    await kv.flush();
    loadFiles();
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", {
      children: "Loading..."
    });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", {
      children: ["Error ", error]
    });
  }
  return /* @__PURE__ */ jsxs("div", {
    children: ["Authenticated as: ", (_a = auth2.user) == null ? void 0 : _a.username, /* @__PURE__ */ jsx("div", {
      children: "Existing files:"
    }), /* @__PURE__ */ jsx("div", {
      className: "flex flex-col gap-4",
      children: files.map((file) => /* @__PURE__ */ jsx("div", {
        className: "flex flex-row gap-4",
        children: /* @__PURE__ */ jsx("p", {
          children: file.name
        })
      }, file.id))
    }), /* @__PURE__ */ jsx("div", {
      children: /* @__PURE__ */ jsx("button", {
        className: "bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer",
        onClick: () => handleDelete(),
        children: "Wipe App Data"
      })
    })]
  });
};
const wipe = UNSAFE_withComponentProps(WipeApp);
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: wipe
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-Cn3FMjla.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/index-cdS_NyEs.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-CE67hoZm.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/index-cdS_NyEs.js", "/assets/puter-Bk8wvTe1.js"], "css": ["/assets/root-AWlTueHq.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-COaBNCXV.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/Navbar-B9aSLFaF.js", "/assets/ScoreCircle-CnI3vSBa.js", "/assets/puter-Bk8wvTe1.js", "/assets/clsx-B-dksMZM.js", "/assets/index-cdS_NyEs.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/auth": { "id": "routes/auth", "parentId": "root", "path": "/auth", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/auth-DAN9k5mq.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/puter-Bk8wvTe1.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/upload": { "id": "routes/upload", "parentId": "root", "path": "/upload", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/upload-D6O2g71E.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/Navbar-B9aSLFaF.js", "/assets/utils-D7j2Gwqz.js", "/assets/puter-Bk8wvTe1.js", "/assets/clsx-B-dksMZM.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/resume": { "id": "routes/resume", "parentId": "root", "path": "/resume/:id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/resume-3Z7NcxwX.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/puter-Bk8wvTe1.js", "/assets/utils-D7j2Gwqz.js", "/assets/clsx-B-dksMZM.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/comparison": { "id": "routes/comparison", "parentId": "root", "path": "/comparison", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/comparison-4JAIxweK.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/puter-Bk8wvTe1.js", "/assets/Navbar-B9aSLFaF.js", "/assets/ScoreCircle-CnI3vSBa.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/chat": { "id": "routes/chat", "parentId": "root", "path": "/chat", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/chat-uh-cPeuI.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/puter-Bk8wvTe1.js", "/assets/Navbar-B9aSLFaF.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/wipe": { "id": "routes/wipe", "parentId": "root", "path": "/wipe", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/wipe-DMbFI3Qe.js", "imports": ["/assets/chunk-B7RQU5TL-CzFyPpmW.js", "/assets/puter-Bk8wvTe1.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-a743e4d4.js", "version": "a743e4d4", "sri": void 0 };
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v8_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "routes/auth": {
    id: "routes/auth",
    parentId: "root",
    path: "/auth",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/upload": {
    id: "routes/upload",
    parentId: "root",
    path: "/upload",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/resume": {
    id: "routes/resume",
    parentId: "root",
    path: "/resume/:id",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/comparison": {
    id: "routes/comparison",
    parentId: "root",
    path: "/comparison",
    index: void 0,
    caseSensitive: void 0,
    module: route5
  },
  "routes/chat": {
    id: "routes/chat",
    parentId: "root",
    path: "/chat",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/wipe": {
    id: "routes/wipe",
    parentId: "root",
    path: "/wipe",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
