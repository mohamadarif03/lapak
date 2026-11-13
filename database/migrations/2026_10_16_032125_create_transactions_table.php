<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // income, expense
            $table->unsignedBigInteger('amount');
            $table->string('item');
            $table->integer('quantity')->default(1);
            $table->string('category')->nullable();
            $table->text('note')->nullable();
            $table->string('source')->default('voice'); // voice, manual
            $table->timestamp('occurred_at');
            $table->string('idempotency_key')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'occurred_at']);
            $table->index(['business_id', 'idempotency_key']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
