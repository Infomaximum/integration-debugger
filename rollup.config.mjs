import * as packageJson from "./package.json" with { type: "json" };
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";

const externalPackages = [
  ...Object.keys(packageJson.dependencies || {}),
  ...Object.keys(packageJson.peerDependencies || {}),
];

const regexesOfPackages = externalPackages.map(
  (packageName) => new RegExp(`^${packageName}(\/.*)?`)
);

/** @type {import("rollup").RollupOptions[]} */
const config = [
  {
    input: "lib/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/index.esm.js",
        format: "es",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript(),
      resolve(),
      commonjs(),
      del({ targets: "dist", hook: "buildStart", runOnce: true }),
    ],
    external: regexesOfPackages,
  },
];

export default config;
