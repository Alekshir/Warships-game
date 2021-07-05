const presets = [
    [

        "@babel/env",

        {
            targets: {
                edge: "17",
                firefox: "60",
                chrome: "67",
                safari: "11.1"
            },
            useBuiltIns: "usage", //Adds specific imports for polyfills when they are used in each file. We take advantage of the fact that a bundler will load the same polyfill only once.
            corejs:3 //core-js version. Represents polyfills
        },
        
    ],
    ["@babel/preset-typescript"],
    ["@babel/preset-react"]
];

const plugins = [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread"
];

/*module.exports = {
    "presets": [
        "@babel/env",
        "@babel/typescript"
    ],
    "plugins": [
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread"
    ]
}*/

module.exports={
    presets,
    plugins
}