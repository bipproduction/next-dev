import readdirp from 'readdirp';
for await (const entry of readdirp(path.join(process.cwd(), '/src/ui'), { fileFilter: ['*.tsx'] })) {
       
}

buatkan function dari module diatas agar bisa tercetak seperti berikut

home/user
├── foo.js
├── test
|  ├── bar.js
|  └── baz.js
└── bat.js