import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/comparison', 'routes/comparison.tsx'),
    route('/chat', 'routes/chat.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
] satisfies RouteConfig;
