import resolve from '@rollup/plugin-node-resolve';

export default {
    input: 'assets/js/app.js',
    output: [
        {
            format: 'esm',
            file: 'src/bundle.js'
        },
    ],
    plugins: [
        resolve(),
    ]
};