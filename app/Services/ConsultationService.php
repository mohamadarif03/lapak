<?php

namespace App\Services;

use Illuminate\Support\Facades\Session;

class ConsultationService
{
    private const SESSION_BOOKINGS_KEY = 'consultation_bookings';

    private const SESSION_TASKS_KEY = 'consultation_mentor_tasks';

    private const SESSION_CHAT_KEY = 'consultation_chat_messages';

    private const SESSION_FORUM_KEY = 'consultation_forum_posts';

    private const SESSION_PERMISSIONS_KEY = 'consultation_permissions';

    /**
     * Get the default assigned mentor for the UMKM.
     *
     * @return array<string, mixed>
     */
    public function getAssignedMentor(): array
    {
        return [
            'id' => 'mentor-1',
            'name' => 'Kak Rendy Pratama, S.E.',
            'title' => 'Mentor Pemasaran Digital & Konten',
            'institution' => 'Klinik UMKM Digital & Dinas Koperasi',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            'rating' => 4.9,
            'consultation_count' => 142,
            'expertise' => ['Pemasaran Media Sosial', 'Konten Video Kreatif', 'WhatsApp Bisnis', 'Copywriting Promo'],
            'is_available' => true,
            'response_time' => 'Biasanya membalas dalam 1-2 hari kerja',
            'bio' => 'Berpengalaman mendampingi lebih dari 200 pelaku usaha kuliner dan kerajinan menjangkau pembeli baru melalui konten video dan promosi digital yang hemat biaya.',
        ];
    }

    /**
     * Get other available mentors that the UMKM can explore.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getOtherMentors(): array
    {
        return [
            [
                'id' => 'mentor-2',
                'name' => 'Dr. Sri Wahyuni, M.Ak.',
                'title' => 'Konsultan Keuangan & Dosen Akuntansi UMKM',
                'institution' => 'Fakultas Ekonomi & Bisnis',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
                'rating' => 4.95,
                'consultation_count' => 98,
                'expertise' => ['Pemisahan Kas Usaha-Pribadi', 'Perhitungan HPP & Laba', 'Manajemen Utang Usaha'],
                'is_available' => true,
                'response_time' => 'Biasanya membalas dalam 2 hari kerja',
                'bio' => 'Fokus membantu UMKM menata pencatatan keuangan sederhana, menghitung harga pokok produksi (HPP) yang tepat, dan menjaga arus kas tetap sehat.',
            ],
            [
                'id' => 'mentor-3',
                'name' => 'Mas Dimas Anggara, S.Ds.',
                'title' => 'Praktisi Foto Produk & Desain Kemasan',
                'institution' => 'Studio Kreatif UMKM Berdaya',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                'rating' => 4.88,
                'consultation_count' => 120,
                'expertise' => ['Foto Produk Pakai HP', 'Desain Label & Stiker', 'Etalase Visual Menarik'],
                'is_available' => true,
                'response_time' => 'Biasanya membalas dalam 1 hari kerja',
                'bio' => 'Membantu pemilik warung & produsen rumahan membuat foto produk yang menggugah selera hanya bermodal HP dan cahaya jendela rumah.',
            ],
        ];
    }

    /**
     * Get bookings list with fallback seed data.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getBookings(): array
    {
        if (! Session::has(self::SESSION_BOOKINGS_KEY)) {
            $initialBookings = [
                [
                    'id' => 'booking-1',
                    'mentor_id' => 'mentor-1',
                    'mentor_name' => 'Kak Rendy Pratama, S.E.',
                    'mentor_title' => 'Mentor Pemasaran Digital',
                    'mentor_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                    'topic' => 'Pemasaran Digital',
                    'description' => 'Ingin konsultasi jadwal posting konten reels Instagram sambal kemasan dan cara menarik pelanggan dari luar kota.',
                    'preferred_dates' => ['Jumat, 31 Okt 2026 - Pukul 14:00 WIB', 'Sabtu, 1 Nov 2026 - Pukul 10:00 WIB'],
                    'confirmed_date' => 'Jumat, 31 Okt 2026 - Pukul 14:00 WIB',
                    'format' => 'video',
                    'status' => 'dijadwalkan',
                    'meet_link' => 'https://meet.google.com/umkm-dapur-siti',
                    'attachment_name' => 'rencana_jadwal_posting.jpg',
                    'rating' => null,
                    'review' => null,
                    'created_at' => '25 Okt 2026',
                ],
                [
                    'id' => 'booking-2',
                    'mentor_id' => 'mentor-1',
                    'mentor_name' => 'Kak Rendy Pratama, S.E.',
                    'mentor_title' => 'Mentor Pemasaran Digital',
                    'mentor_avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                    'topic' => 'Foto & Kemasan Produk',
                    'description' => 'Evaluasi foto produk sambal cumi dan sambal roa di etalase toko.',
                    'preferred_dates' => ['18 Okt 2026 - Pukul 15:30 WIB'],
                    'confirmed_date' => '18 Okt 2026 - Pukul 15:30 WIB',
                    'format' => 'chat',
                    'status' => 'selesai',
                    'meet_link' => null,
                    'attachment_name' => 'foto_etalase_lama.png',
                    'rating' => 5,
                    'review' => 'Masukan Kak Rendy sangat jelas dan mudah dipraktekkan. Sekarang foto sambal saya jauh lebih terang dan rapi!',
                    'created_at' => '15 Okt 2026',
                ],
            ];
            Session::put(self::SESSION_BOOKINGS_KEY, $initialBookings);
        }

        return Session::get(self::SESSION_BOOKINGS_KEY, []);
    }

    /**
     * Add a new consultation booking.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function createBooking(array $data): array
    {
        $bookings = $this->getBookings();
        $assigned = $this->getAssignedMentor();

        $newBooking = [
            'id' => 'booking-'.(count($bookings) + 1).'-'.time(),
            'mentor_id' => $data['mentor_id'] ?? $assigned['id'],
            'mentor_name' => $data['mentor_name'] ?? $assigned['name'],
            'mentor_title' => $data['mentor_title'] ?? $assigned['title'],
            'mentor_avatar' => $data['mentor_avatar'] ?? $assigned['avatar'],
            'topic' => $data['topic'] ?? 'Pemasaran Digital',
            'description' => $data['description'] ?? '',
            'preferred_dates' => $data['preferred_dates'] ?? ['Pilihan 1: Segera jika mentor bersedia'],
            'confirmed_date' => null,
            'format' => $data['format'] ?? 'chat',
            'status' => 'menunggu',
            'meet_link' => null,
            'attachment_name' => $data['attachment_name'] ?? null,
            'rating' => null,
            'review' => null,
            'created_at' => 'Hari ini',
        ];

        array_unshift($bookings, $newBooking);
        Session::put(self::SESSION_BOOKINGS_KEY, $bookings);

        return $newBooking;
    }

    /**
     * Submit rating & review for completed booking.
     */
    public function rateBooking(string $bookingId, int $rating, ?string $review): bool
    {
        $bookings = $this->getBookings();
        $found = false;

        foreach ($bookings as &$booking) {
            if ($booking['id'] === $bookingId) {
                $booking['rating'] = max(1, min(5, $rating));
                $booking['review'] = $review;
                $found = true;
                break;
            }
        }

        if ($found) {
            Session::put(self::SESSION_BOOKINGS_KEY, $bookings);
        }

        return $found;
    }

    /**
     * Get mentor action items / follow-up tasks ("Yang Perlu Kamu Coba").
     *
     * @return array<int, array<string, mixed>>
     */
    public function getMentorTasks(): array
    {
        if (! Session::has(self::SESSION_TASKS_KEY)) {
            $initialTasks = [
                [
                    'id' => 'task-1',
                    'title' => 'Foto ulang botol sambal dengan cahaya matahari pagi',
                    'description' => 'Letakkan botol sambal di dekat jendela jam 08.00 - 09.30 WIB agar warna sambal terlihat merah segar alami tanpa blitz.',
                    'category' => 'Foto & Kemasan',
                    'is_completed' => true,
                    'created_at' => '18 Okt 2026',
                    'due_date' => '22 Okt 2026',
                ],
                [
                    'id' => 'task-2',
                    'title' => 'Lengkapi deskripsi sambal dengan daya tahan & saran penyimpanan',
                    'description' => 'Tambahkan info: Tahan 2 minggu suhu ruang, 2 bulan di kulkas. Pelanggan ragu beli jika tidak tahu masa simpannya.',
                    'category' => 'Etalase Online',
                    'is_completed' => true,
                    'created_at' => '18 Okt 2026',
                    'due_date' => '23 Okt 2026',
                ],
                [
                    'id' => 'task-3',
                    'title' => 'Buat video pendek 15 detik saat mengaduk sambal roa',
                    'description' => 'Ambil video vertikal pendek saat proses masak untuk bahan postingan Instagram reels jam makan siang.',
                    'category' => 'Pemasaran Digital',
                    'is_completed' => false,
                    'created_at' => '25 Okt 2026',
                    'due_date' => '30 Okt 2026',
                ],
                [
                    'id' => 'task-4',
                    'title' => 'Pisahkan uang kembalian warung dari dompet uang belanja dapur',
                    'description' => 'Sediakan satu dompet khusus hanya untuk uang masuk penjualan sambal agar modal tidak terpakai urusan rumah.',
                    'category' => 'Keuangan',
                    'is_completed' => false,
                    'created_at' => '25 Okt 2026',
                    'due_date' => '1 Nov 2026',
                ],
            ];
            Session::put(self::SESSION_TASKS_KEY, $initialTasks);
        }

        return Session::get(self::SESSION_TASKS_KEY, []);
    }

    /**
     * Toggle completion state of a mentor follow-up task.
     */
    public function toggleTask(string $taskId): array
    {
        $tasks = $this->getMentorTasks();
        $updatedTask = null;

        foreach ($tasks as &$task) {
            if ($task['id'] === $taskId) {
                $task['is_completed'] = ! $task['is_completed'];
                $updatedTask = $task;
                break;
            }
        }

        Session::put(self::SESSION_TASKS_KEY, $tasks);

        return [
            'success' => $updatedTask !== null,
            'task' => $updatedTask,
            'tasks' => $tasks,
        ];
    }

    /**
     * Get chat messages between UMKM and assigned mentor.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getChatMessages(): array
    {
        if (! Session::has(self::SESSION_CHAT_KEY)) {
            $initialChat = [
                [
                    'id' => 'msg-1',
                    'sender' => 'mentor',
                    'text' => 'Halo Ibu Siti! Selamat datang di sesi pendampingan UMKM. Ada hal seputar promosi sambal atau etalase toko yang ingin dibahas hari ini?',
                    'image_url' => null,
                    'timestamp' => 'Kemarin, 09:15',
                    'status' => 'read',
                ],
                [
                    'id' => 'msg-2',
                    'sender' => 'umkm',
                    'text' => 'Halo Kak Rendy, terima kasih. Saya sudah ganti foto produk sambal cumi pakai cahaya jendela seperti yang Kakak sarankan tempo hari.',
                    'image_url' => null,
                    'timestamp' => 'Kemarin, 10:20',
                    'status' => 'read',
                ],
                [
                    'id' => 'msg-3',
                    'sender' => 'mentor',
                    'text' => 'Wah luar biasa Bu Siti! Fotonya jauh lebih terang dan menggoda selera. Nanti saat sesi konsultasi video hari Jumat kita bahas cara membuat video pendeknya ya Bu.',
                    'image_url' => null,
                    'timestamp' => 'Kemarin, 14:05',
                    'status' => 'read',
                ],
                [
                    'id' => 'msg-4',
                    'sender' => 'mentor',
                    'text' => 'Oya, kalau ada ide konten yang mau ditanyakan terlebih dahulu, Ibu bisa kirimkan lewat sini kapan saja.',
                    'image_url' => null,
                    'timestamp' => 'Kemarin, 14:06',
                    'status' => 'read',
                ],
            ];
            Session::put(self::SESSION_CHAT_KEY, $initialChat);
        }

        return Session::get(self::SESSION_CHAT_KEY, []);
    }

    /**
     * Send a new chat message.
     */
    public function sendMessage(string $text, ?string $imageUrl = null): array
    {
        $messages = $this->getChatMessages();

        $newMessage = [
            'id' => 'msg-'.(count($messages) + 1).'-'.time(),
            'sender' => 'umkm',
            'text' => htmlspecialchars(strip_tags($text), ENT_QUOTES, 'UTF-8'),
            'image_url' => $imageUrl,
            'timestamp' => 'Baru saja',
            'status' => 'delivered',
        ];

        $messages[] = $newMessage;

        // Auto-reply simulation for responsive experience
        $autoReply = [
            'id' => 'msg-'.(count($messages) + 2).'-'.(time() + 1),
            'sender' => 'mentor',
            'text' => 'Terima kasih pertanyaannya Bu Siti! Pesan sudah saya terima. Saya akan pelajari dan berikan tanggapan segera ya Bu (maksimal 1-2 hari kerja). Semangat terus usahanya!',
            'image_url' => null,
            'timestamp' => 'Baru saja',
            'status' => 'read',
        ];

        $messages[] = $autoReply;

        Session::put(self::SESSION_CHAT_KEY, $messages);

        return [
            'new_message' => $newMessage,
            'auto_reply' => $autoReply,
            'all_messages' => $messages,
        ];
    }

    /**
     * Get forum posts for UMKM community discussions.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getForumPosts(): array
    {
        if (! Session::has(self::SESSION_FORUM_KEY)) {
            $initialForum = [
                [
                    'id' => 'post-1',
                    'title' => 'Tips kemasan frozen food sambal botol agar tidak bocor saat kirim luar kota?',
                    'content' => 'Halo bapak ibu pelaku usaha kuliner, ada yang punya pengalaman kirim sambal botol kaca/plastik ke luar kota dengan ekspedisi reguler? Saya khawatir pecah atau bocor saat terbanting di jalan.',
                    'author_name' => 'Ibu Siti',
                    'author_store' => 'Dapur Bu Siti',
                    'is_author_me' => true,
                    'category' => 'Produk & Kemasan',
                    'replies_count' => 3,
                    'likes_count' => 8,
                    'is_liked_by_me' => false,
                    'is_solved' => true,
                    'created_at' => '2 hari yang lalu',
                    'replies' => [
                        [
                            'id' => 'rep-1',
                            'post_id' => 'post-1',
                            'author_name' => 'Pak Joko',
                            'author_store' => 'Keripik Renyah Mandiri',
                            'is_mentor' => false,
                            'text' => 'Gunakan seal alumunium foil di mulut botol dengan setrika panas Bu, lalu bungkus bubble wrap minimal 3 lapis per botol.',
                            'likes_count' => 4,
                            'is_liked_by_me' => false,
                            'is_best_answer' => false,
                            'created_at' => '2 hari yang lalu',
                        ],
                        [
                            'id' => 'rep-2',
                            'post_id' => 'post-1',
                            'author_name' => 'Mas Dimas Anggara, S.Ds.',
                            'author_store' => 'Studio Kreatif UMKM Berdaya',
                            'is_mentor' => true,
                            'text' => 'Saran saya ganti botol kaca dengan botol plastik PET tebal untuk kiriman ekspedisi Bu Siti. Selain lebih tahan banting, bobotnya lebih ringan sehingga ongkos kirim pelanggan lebih hemat.',
                            'likes_count' => 11,
                            'is_liked_by_me' => true,
                            'is_best_answer' => true,
                            'created_at' => '1 hari yang lalu',
                        ],
                    ],
                ],
                [
                    'id' => 'post-2',
                    'title' => 'Cara santun menanggapi pembeli yang sudah tanya detail tapi tiba-tiba PHP?',
                    'content' => 'Seringkali ada calon pembeli di WhatsApp yang tanya harga dan minta foto detail, tapi setelah ditotal langsung tidak membalas lagi. Apakah perlu di-follow up atau dibiarkan saja ya?',
                    'author_name' => 'Mbak Maya',
                    'author_store' => 'Kue Kering Barokah',
                    'is_author_me' => false,
                    'category' => 'Pemasaran',
                    'replies_count' => 4,
                    'likes_count' => 15,
                    'is_liked_by_me' => true,
                    'is_solved' => false,
                    'created_at' => '3 hari yang lalu',
                    'replies' => [
                        [
                            'id' => 'rep-3',
                            'post_id' => 'post-2',
                            'author_name' => 'Kak Rendy Pratama, S.E.',
                            'author_store' => 'Klinik UMKM Digital',
                            'is_mentor' => true,
                            'text' => 'Jangan langsung ditagih ya Mbak. Tunggu 24 jam, lalu sapa dengan ramah: "Halo Kak Maya, pesanan kuenya mau disiapkan untuk pengiriman hari ini atau besok ya?". Selalu tawarkan pilihan solusi.',
                            'likes_count' => 18,
                            'is_liked_by_me' => true,
                            'is_best_answer' => false,
                            'created_at' => '2 hari yang lalu',
                        ],
                    ],
                ],
                [
                    'id' => 'post-3',
                    'title' => 'Apakah aman mencatat modal harian di buku kas digital seperti ini?',
                    'content' => 'Dulu saya selalu tulis di buku nota kertas, tapi sering terselip atau kena cipratan minyak di dapur. Mau tanya bapak ibu yang sudah pakai aplikasi, apakah data aman dan gampang dilihat saat belanja stok?',
                    'author_name' => 'Pak Bambang',
                    'author_store' => 'Warung Ayam Goreng Sedap',
                    'is_author_me' => false,
                    'category' => 'Keuangan',
                    'replies_count' => 2,
                    'likes_count' => 6,
                    'is_liked_by_me' => false,
                    'is_solved' => true,
                    'created_at' => '4 hari yang lalu',
                    'replies' => [
                        [
                            'id' => 'rep-4',
                            'post_id' => 'post-3',
                            'author_name' => 'Dr. Sri Wahyuni, M.Ak.',
                            'author_store' => 'Dosen Akuntansi UMKM',
                            'is_mentor' => true,
                            'text' => 'Sangat aman Pak Bambang. Data tersimpan di akun Anda dan tidak akan hilang walau buku nota basah. Pastikan langsung catat pengeluaran belanja saat baru keluar dari pasar agar tidak lupa.',
                            'likes_count' => 7,
                            'is_liked_by_me' => false,
                            'is_best_answer' => true,
                            'created_at' => '3 hari yang lalu',
                        ],
                    ],
                ],
            ];
            Session::put(self::SESSION_FORUM_KEY, $initialForum);
        }

        return Session::get(self::SESSION_FORUM_KEY, []);
    }

    /**
     * Create a new forum discussion thread.
     */
    public function createForumPost(string $title, string $content, string $category): array
    {
        $posts = $this->getForumPosts();

        // Sanitize against XSS and hide sensitive data
        $cleanTitle = htmlspecialchars(strip_tags(trim($title)), ENT_QUOTES, 'UTF-8');
        $cleanContent = htmlspecialchars(strip_tags(trim($content)), ENT_QUOTES, 'UTF-8');

        $newPost = [
            'id' => 'post-'.(count($posts) + 1).'-'.time(),
            'title' => $cleanTitle,
            'content' => $cleanContent,
            'author_name' => 'Ibu Siti',
            'author_store' => 'Dapur Bu Siti',
            'is_author_me' => true,
            'category' => $category,
            'replies_count' => 0,
            'likes_count' => 1,
            'is_liked_by_me' => true,
            'is_solved' => false,
            'created_at' => 'Baru saja',
            'replies' => [],
        ];

        array_unshift($posts, $newPost);
        Session::put(self::SESSION_FORUM_KEY, $posts);

        return $newPost;
    }

    /**
     * Add a reply to a forum post.
     */
    public function replyForumPost(string $postId, string $text): array
    {
        $posts = $this->getForumPosts();
        $newReply = null;
        $cleanText = htmlspecialchars(strip_tags(trim($text)), ENT_QUOTES, 'UTF-8');

        foreach ($posts as &$post) {
            if ($post['id'] === $postId) {
                $newReply = [
                    'id' => 'rep-'.(count($post['replies']) + 1).'-'.time(),
                    'post_id' => $postId,
                    'author_name' => 'Ibu Siti',
                    'author_store' => 'Dapur Bu Siti',
                    'is_mentor' => false,
                    'text' => $cleanText,
                    'likes_count' => 0,
                    'is_liked_by_me' => false,
                    'is_best_answer' => false,
                    'created_at' => 'Baru saja',
                ];
                $post['replies'][] = $newReply;
                $post['replies_count'] = count($post['replies']);
                break;
            }
        }

        Session::put(self::SESSION_FORUM_KEY, $posts);

        return [
            'reply' => $newReply,
            'posts' => $posts,
        ];
    }

    /**
     * Mark a reply as best answer by thread author.
     */
    public function markBestAnswer(string $postId, string $replyId): bool
    {
        $posts = $this->getForumPosts();
        $updated = false;

        foreach ($posts as &$post) {
            if ($post['id'] === $postId) {
                foreach ($post['replies'] as &$reply) {
                    if ($reply['id'] === $replyId) {
                        $reply['is_best_answer'] = ! $reply['is_best_answer'];
                        $post['is_solved'] = $reply['is_best_answer'];
                        $updated = true;
                    } else {
                        $reply['is_best_answer'] = false;
                    }
                }
                break;
            }
        }

        if ($updated) {
            Session::put(self::SESSION_FORUM_KEY, $posts);
        }

        return $updated;
    }

    /**
     * Toggle like on post or reply.
     */
    public function toggleLike(string $postId, ?string $replyId = null): array
    {
        $posts = $this->getForumPosts();

        foreach ($posts as &$post) {
            if ($post['id'] === $postId) {
                if ($replyId === null) {
                    $liked = ! ($post['is_liked_by_me'] ?? false);
                    $post['is_liked_by_me'] = $liked;
                    $post['likes_count'] = max(0, $post['likes_count'] + ($liked ? 1 : -1));
                } else {
                    foreach ($post['replies'] as &$reply) {
                        if ($reply['id'] === $replyId) {
                            $liked = ! ($reply['is_liked_by_me'] ?? false);
                            $reply['is_liked_by_me'] = $liked;
                            $reply['likes_count'] = max(0, $reply['likes_count'] + ($liked ? 1 : -1));
                            break;
                        }
                    }
                }
                break;
            }
        }

        Session::put(self::SESSION_FORUM_KEY, $posts);

        return ['success' => true, 'posts' => $posts];
    }

    /**
     * Get data sharing permissions with security default (finance = false).
     *
     * @return array<string, mixed>
     */
    public function getDataSharingPermissions(): array
    {
        if (! Session::has(self::SESSION_PERMISSIONS_KEY)) {
            $defaultPermissions = [
                'share_profile' => true,
                'share_products' => true,
                'share_finance' => false, // DEFAULT FALSE FOR PRIVACY
                'share_learning' => true,
                'last_updated' => '25 Okt 2026',
            ];
            Session::put(self::SESSION_PERMISSIONS_KEY, $defaultPermissions);
        }

        return Session::get(self::SESSION_PERMISSIONS_KEY, []);
    }

    /**
     * Update data sharing permissions.
     *
     * @param  array<string, bool>  $updates
     * @return array<string, mixed>
     */
    public function updatePermissions(array $updates): array
    {
        $current = $this->getDataSharingPermissions();

        $merged = [
            'share_profile' => isset($updates['share_profile']) ? (bool) $updates['share_profile'] : $current['share_profile'],
            'share_products' => isset($updates['share_products']) ? (bool) $updates['share_products'] : $current['share_products'],
            'share_finance' => isset($updates['share_finance']) ? (bool) $updates['share_finance'] : false,
            'share_learning' => isset($updates['share_learning']) ? (bool) $updates['share_learning'] : $current['share_learning'],
            'last_updated' => 'Hari ini',
        ];

        Session::put(self::SESSION_PERMISSIONS_KEY, $merged);

        return $merged;
    }

    /**
     * Revoke all permissions at once.
     *
     * @return array<string, mixed>
     */
    public function revokeAllPermissions(): array
    {
        $revoked = [
            'share_profile' => false,
            'share_products' => false,
            'share_finance' => false,
            'share_learning' => false,
            'last_updated' => 'Baru saja dicabut',
        ];

        Session::put(self::SESSION_PERMISSIONS_KEY, $revoked);

        return $revoked;
    }

    /**
     * Quick suggestion prompts for chat with mentor.
     *
     * @return array<int, string>
     */
    public function getQuickSuggestions(): array
    {
        return [
            'Bagaimana cara mulai posting di Instagram?',
            'Bolehkah minta saran foto kemasan sambal saya?',
            'Kenapa pembeli di WhatsApp sering batal beli?',
            'Berapa harga yang pas untuk sambal kemasan 150 gram?',
        ];
    }

    /**
     * Comprehensive FAQs for Help Center tab.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getFaqs(): array
    {
        return [
            [
                'id' => 'faq-1',
                'category' => 'Memulai & Akun',
                'question' => 'Bagaimana cara mengganti nomor WhatsApp untuk menerima pesanan?',
                'answer' => 'Masuk ke menu Profil di pojok kanan atas, lalu ubah nomor WhatsApp bisnis Anda. Semua tombol "Pesan via WhatsApp" di etalase toko akan otomatis mengarah ke nomor baru.',
                'action_label' => 'Buka Pengaturan Profil',
                'action_url' => '/profile',
            ],
            [
                'id' => 'faq-2',
                'category' => 'Produk & Etalase',
                'question' => 'Bagaimana cara membagikan link etalase produk ke pelanggan?',
                'answer' => 'Buka menu "Produk & Etalase", lalu klik tombol "Salin Link Toko" atau tombol "Bagikan ke WhatsApp". Pelanggan dapat langsung membuka toko online Anda tanpa perlu menginstal aplikasi.',
                'action_label' => 'Buka Produk & Etalase',
                'action_url' => '/produk',
            ],
            [
                'id' => 'faq-3',
                'category' => 'Konten & Promosi',
                'question' => 'Apakah tulisan caption dari Asisten AI boleh diedit sebelum diposting?',
                'answer' => 'Tentu saja! Hasil dari Asisten AI adalah draf awal. Anda bisa menyunting kalimat, menambahkan nama toko, atau mengganti harga promo sebelum menyalin ke media sosial Anda.',
                'action_label' => 'Buka Konten & Promosi',
                'action_url' => '/promosi',
            ],
            [
                'id' => 'faq-4',
                'category' => 'Keuangan',
                'question' => 'Kenapa uang kas usaha dan uang pribadi harus dipisahkan?',
                'answer' => 'Mencampur uang belanja rumah dan uang modal jualan membuat pemilik usaha tidak tahu laba sebenarnya, dan berisiko modal kulakan terpakai untuk kebutuhan harian.',
                'action_label' => 'Buka Catatan Kas',
                'action_url' => '/keuangan',
            ],
            [
                'id' => 'faq-5',
                'category' => 'Belajar',
                'question' => 'Apakah tes di Pojok Belajar mempengaruhi status akun saya?',
                'answer' => 'Tidak sama sekali. Tes awal dan tes akhir hanya bertujuan untuk mengukur peningkatan pemahaman Anda secara pribadi dan memberikan sertifikat digital.',
                'action_label' => 'Buka Pojok Belajar',
                'action_url' => '/belajar',
            ],
        ];
    }
}
