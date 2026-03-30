import {
  __commonJS,
  __name,
  __require,
  init_esm
} from "./chunk-KUOAKOUY.mjs";

// node_modules/@ffprobe-installer/ffprobe/lib/verify-file.js
var require_verify_file = __commonJS({
  "node_modules/@ffprobe-installer/ffprobe/lib/verify-file.js"(exports, module) {
    init_esm();
    var fs = __require("node:fs");
    function verifyFile(file) {
      try {
        const stats = fs.statSync(file);
        return stats.isFile();
      } catch {
        return false;
      }
    }
    __name(verifyFile, "verifyFile");
    module.exports = verifyFile;
  }
});

// node_modules/@ffprobe-installer/ffprobe/package.json
var require_package = __commonJS({
  "node_modules/@ffprobe-installer/ffprobe/package.json"(exports, module) {
    module.exports = {
      name: "@ffprobe-installer/ffprobe",
      version: "2.1.2",
      main: "index.js",
      scripts: {
        lint: "xo",
        preversion: "npm run test",
        types: "tsc",
        test: "xo && nyc ava && nyc report --reporter=text-lcov > coverage.lcov && codecov -t 54b3d620-a296-4d71-a717-c3e6e24ae9d9",
        prepare: "npm run types && husky install && shx rm -rf .git/hooks && shx ln -s ../.husky .git/hooks"
      },
      types: "types/index.d.ts",
      keywords: [
        "ffprobe",
        "binary"
      ],
      author: "Oliver Sayers <talk@savagecore.uk>",
      license: "LGPL-2.1",
      description: "Platform independent binary installer of FFprobe for node projects",
      files: [
        "index.js",
        "lib",
        "platform",
        "types",
        "tsconfig.json"
      ],
      optionalDependencies: {
        "@ffprobe-installer/darwin-arm64": "5.0.1",
        "@ffprobe-installer/darwin-x64": "5.1.0",
        "@ffprobe-installer/linux-arm": "5.2.0",
        "@ffprobe-installer/linux-arm64": "5.2.0",
        "@ffprobe-installer/linux-ia32": "5.2.0",
        "@ffprobe-installer/linux-x64": "5.2.0",
        "@ffprobe-installer/win32-ia32": "5.1.0",
        "@ffprobe-installer/win32-x64": "5.1.0"
      },
      devDependencies: {
        ava: "^5.2.0",
        codecov: "^3.7.2",
        execa: "^8.0.1",
        executable: "^4.1.1",
        husky: "^8.0.3",
        nyc: "^15.1.0",
        shx: "^0.3.3",
        typescript: "^5.1.6",
        xo: "^0.56.0"
      },
      repository: {
        type: "git",
        url: "git+https://github.com/SavageCore/node-ffprobe-installer.git"
      },
      bugs: {
        url: "https://github.com/SavageCore/node-ffprobe-installer/issues"
      },
      homepage: "https://github.com/SavageCore/node-ffprobe-installer#readme",
      xo: {
        rules: {
          "unicorn/prefer-module": 0,
          "unicorn/prefer-top-level-await": 0
        }
      },
      engines: {
        node: ">=14.21.2"
      }
    };
  }
});

// node_modules/@ffprobe-installer/ffprobe/index.js
var require_ffprobe = __commonJS({
  "node_modules/@ffprobe-installer/ffprobe/index.js"(exports, module) {
    init_esm();
    var os = __require("node:os");
    var process = __require("node:process");
    var verifyFile = require_verify_file();
    var platform = process.env.npm_config_platform || os.platform();
    var arch = process.env.npm_config_arch || os.arch();
    var target = platform + "-" + arch;
    var packageName = "@ffprobe-installer/" + target;
    if (!require_package().optionalDependencies[packageName]) {
      throw new Error("Unsupported platform/architecture: " + target);
    }
    var binary = platform === "win32" ? "ffprobe.exe" : "ffprobe";
    var ffprobePath = __require.resolve(`${packageName}/${binary}`);
    if (!verifyFile(ffprobePath)) {
      throw new Error(`Could not find ffprobe executable, tried "${ffprobePath}"`);
    }
    var packageJson = __require(`${packageName}/package.json`);
    var version = packageJson.ffprobe || packageJson.version;
    var url = packageJson.homepage;
    module.exports = {
      path: ffprobePath,
      version,
      url
    };
  }
});
export default require_ffprobe();
//# sourceMappingURL=ffprobe-3I2JDTBA.mjs.map
