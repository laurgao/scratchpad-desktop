import react from "@vitejs/plugin-react";
import { join } from "path";
import { ConfigEnv, UserConfig } from "vite";

const srcRoot = join(__dirname, "src");

export default ({ command }: ConfigEnv): UserConfig => {
    // DEV
    if (command === "serve") {
        return {
            root: srcRoot,
            base: "/",
            plugins: [react()],
            resolve: {
                alias: {
                    "/@": srcRoot
                }
            },
            build: {
                outDir: join(srcRoot, "/out"),
                emptyOutDir: true,
                rollupOptions: {}
            },
            server: {
                port: process.env.PORT === undefined ? 4000 : +process.env.PORT
            },
            optimizeDeps: {
                exclude: ["path"]
            }
        };
    }
    // PROD
    return {
        root: srcRoot,
        base: "./",
        plugins: [react()],
        resolve: {
            alias: {
                "/@": srcRoot
            }
        },
        build: {
            outDir: join(srcRoot, "/out"),
            emptyOutDir: true,
            rollupOptions: {}
        },
        server: {
            port: process.env.PORT === undefined ? 4000 : +process.env.PORT
        },
        optimizeDeps: {
            exclude: ["path"]
        }
    };
};
