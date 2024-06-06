Jika Anda menggunakan PM2 sebagai process manager dan Nginx sebagai server di Ubuntu, ada beberapa langkah dan praktik yang bisa Anda terapkan untuk meningkatkan kinerja server dan aplikasi Anda. Berikut adalah langkah-langkah yang dapat Anda ikuti:

### 1. Konfigurasi PM2
PM2 adalah process manager yang kuat untuk Node.js, dan memiliki banyak fitur untuk memastikan aplikasi Anda berjalan optimal.

#### a. Start Multiple Instances
PM2 memungkinkan Anda untuk menjalankan beberapa instance aplikasi Anda untuk memanfaatkan semua core CPU yang tersedia:

```sh
pm2 start app.js -i max
```
`-i max` akan menjalankan satu instance untuk setiap core CPU.

#### b. Monitoring and Auto-Restart
Pastikan PM2 mengawasi aplikasi Anda dan me-restart secara otomatis jika terjadi crash:

```sh
pm2 start app.js --watch
```
Gunakan `--watch` jika Anda ingin PM2 me-restart aplikasi saat mendeteksi perubahan pada file.

#### c. Log Management
PM2 mengelola log aplikasi Anda, yang bisa membantu dalam monitoring dan debugging:

```sh
pm2 logs
```
Anda juga dapat menggabungkan log untuk menghindari file log yang terlalu banyak:

```sh
pm2 install pm2-logrotate
```

### 2. Konfigurasi Nginx
Nginx dapat digunakan sebagai reverse proxy untuk meneruskan permintaan ke aplikasi Node.js Anda yang dikelola oleh PM2.

#### a. Nginx Configuration File
Edit file konfigurasi Nginx untuk menambahkan pengaturan reverse proxy:

```sh
sudo nano /etc/nginx/sites-available/default
```

Tambahkan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### b. Test Configuration and Restart Nginx
Setelah melakukan perubahan, pastikan konfigurasi Nginx Anda benar:

```sh
sudo nginx -t
```

Jika tidak ada kesalahan, restart Nginx:

```sh
sudo systemctl restart nginx
```

### 3. Konfigurasi Ubuntu Server
Beberapa pengaturan pada server Ubuntu Anda dapat membantu meningkatkan kinerja aplikasi.

#### a. Ubah Limits File Descriptors
Untuk menangani lebih banyak koneksi simultan, tingkatkan limit file descriptors:

Edit file `/etc/security/limits.conf` dan tambahkan:

```sh
*               soft    nofile          10000
*               hard    nofile          30000
```

#### b. Swappiness Setting
Kurangi nilai swappiness untuk mengurangi penggunaan swap dan meningkatkan performa:

```sh
sudo sysctl vm.swappiness=10
```

Untuk membuat perubahan ini permanen, tambahkan ke `/etc/sysctl.conf`:

```sh
vm.swappiness=10
```

### 4. Caching dan CDN
Menggunakan caching dan CDN dapat sangat meningkatkan kinerja aplikasi Anda.

#### a. Enable Caching in Nginx
Anda bisa mengaktifkan caching di Nginx untuk mengurangi beban pada aplikasi Node.js:

```nginx
location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 1h;
    proxy_pass http://localhost:3000;
    ...
}

proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m inactive=60m use_temp_path=off;
```

#### b. Use a CDN
Gunakan CDN untuk mengirimkan konten statis seperti gambar, CSS, dan JavaScript. CDN akan mengurangi beban pada server Anda dan meningkatkan kecepatan pengiriman konten ke pengguna di seluruh dunia.

### 5. Optimize Application Code
Pastikan aplikasi Node.js Anda dioptimalkan:

- **Database Optimization**: Gunakan indexing yang tepat, dan optimalkan query database.
- **Memory Management**: Pastikan aplikasi Anda tidak mengalami memory leaks.
- **Async Operations**: Gunakan operasi asynchronous untuk menghindari blocking pada event loop.

### 6. Monitoring dan Performance Tuning
Menggunakan alat monitoring dapat membantu Anda mengidentifikasi bottleneck dan mengoptimalkan kinerja.

- **PM2 Monitoring**: Gunakan PM2 Plus atau Keymetrics untuk memonitor kinerja aplikasi Anda.
- **Nginx Logs**: Analisis log Nginx untuk memahami lalu lintas dan performa.
- **System Monitoring**: Gunakan alat seperti `htop`, `nmon`, atau `netdata` untuk memonitor resource server.

Dengan menggabungkan langkah-langkah di atas, Anda dapat meningkatkan kinerja dan skalabilitas aplikasi Anda yang berjalan di Ubuntu dengan PM2 dan Nginx.