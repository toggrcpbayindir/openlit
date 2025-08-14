#!/usr/bin/env python3
"""
Demo script for Coin Calculator

This script demonstrates the coin calculation functionality
with sample data to show how the application works.
"""

from coin_calculator import CoinCalculator, JobParameters
import datetime

def demo_coin_calculator():
    """Demonstrate the coin calculator with sample data."""
    
    print("=" * 60)
    print("           COIN CALCULATOR DEMO")
    print("=" * 60)
    print("Bu demo, coin hesaplama algoritmasının nasıl çalıştığını gösterir.")
    print()
    
    # Create calculator instance
    calc = CoinCalculator()
    
    # Sample jobs
    jobs_data = [
        {
            'name': 'Web Geliştirme',
            'w_i': 3.0,    # Work difficulty
            'd_i': 2.0,    # Priority
            't_ideal': 8.0, # Ideal time (hours)
            't_real': 6.0,  # Real time (hours)
            'p_i': 1.5,    # Demand
            's_i': 2.2     # Strategic
        },
        {
            'name': 'Veri Analizi',
            'w_i': 2.5,
            'd_i': 1.8,
            't_ideal': 4.0,
            't_real': 5.0,
            'p_i': 1.3,
            's_i': 1.9
        },
        {
            'name': 'UI Tasarım',
            'w_i': 2.0,
            'd_i': 1.5,
            't_ideal': 6.0,
            't_real': 4.5,
            'p_i': 1.4,
            's_i': 1.6
        }
    ]
    
    # Add jobs to calculator
    print("Örnek İşler:")
    print("-" * 40)
    for job_data in jobs_data:
        job = JobParameters(
            job_data['name'],
            job_data['w_i'],
            job_data['d_i'],
            job_data['t_ideal'],
            job_data['t_real'],
            job_data['p_i'],
            job_data['s_i']
        )
        calc.add_job(job)
        
        # Show job details
        print(f"\n📋 {job.name}:")
        print(f"   • Zorluk Katsayısı (W_i): {job.w_i}")
        print(f"   • Öncelik Katsayısı (D_i): {job.d_i}")
        print(f"   • İdeal Süre: {job.t_ideal} saat")
        print(f"   • Gerçek Süre: {job.t_real} saat")
        print(f"   • Talep Katsayısı (P_i): {job.p_i}")
        print(f"   • Stratejik Katsayı (S_i): {job.s_i}")
        
        # Calculate single coin value
        coin_value = calc.calculate_coin_value(job)
        print(f"   💰 Yarım Saatlik Coin Değeri: {coin_value:.4f}")
    
    print("\n" + "=" * 80)
    print("                    ZAMAN SERİSİ ANALİZİ")
    print("=" * 80)
    
    # Generate time series for 4 hours (8 intervals)
    duration = 4
    time_series = calc.calculate_time_series(duration)
    
    print(f"Süre: {duration} saat ({len(time_series)} yarım saatlik dilim)")
    print()
    
    # Display time series table
    print("Zaman".ljust(8), end="")
    for job in calc.jobs:
        print(job.name[:12].ljust(15), end="")
    print()
    print("-" * (8 + 15 * len(calc.jobs)))
    
    for time_str, coin_values in time_series:
        print(time_str.ljust(8), end="")
        for job in calc.jobs:
            coin_value = coin_values.get(job.name, 0)
            print(f"{coin_value:.4f}".ljust(15), end="")
        print()
    
    print("-" * (8 + 15 * len(calc.jobs)))
    
    # Calculate and display summary statistics
    print("\n📊 ÖZET İSTATİSTİKLER:")
    print("-" * 40)
    
    for job in calc.jobs:
        total_coins = sum(coin_values.get(job.name, 0) 
                         for _, coin_values in time_series)
        avg_coins = total_coins / len(time_series)
        efficiency = job.t_ideal / job.t_real
        
        print(f"\n{job.name}:")
        print(f"   • {duration} saatlik toplam coin: {total_coins:.4f}")
        print(f"   • Yarım saatlik ortalama: {avg_coins:.4f}")
        print(f"   • Zaman verimliliği: {efficiency:.2f}x")
        
        if efficiency > 1:
            print("   ✅ İdeal süreden daha hızlı tamamlandı!")
        elif efficiency < 1:
            print("   ⚠️  İdeal süreden daha uzun sürdü.")
        else:
            print("   ➖ İdeal sürede tamamlandı.")
    
    print("\n" + "=" * 60)
    print("Demo tamamlandı! Gerçek kullanım için 'python coin_calculator.py' çalıştırın.")
    print("=" * 60)

if __name__ == "__main__":
    demo_coin_calculator()