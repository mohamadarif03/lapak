<?php

namespace App\Console\Commands;

use App\Support\LandingHelper;
use Illuminate\Console\Command;

class CleanupDemoAccountsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'demo:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired demo accounts and all their associated data';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting expired demo accounts cleanup...');
        $cleaned = LandingHelper::cleanupExpiredDemos();
        $this->info("Successfully cleaned up {$cleaned} expired demo account(s).");

        return Command::SUCCESS;
    }
}
