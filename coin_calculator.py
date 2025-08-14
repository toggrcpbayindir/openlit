#!/usr/bin/env python3
"""
Coin Calculation Terminal Application

This application calculates coin values for jobs based on various coefficients
and displays the results as a time series for half-hour intervals.

Author: OpenLIT Team
License: Apache-2.0
"""

import sys
import datetime
from typing import Dict, List, Tuple


class JobParameters:
    """Class to hold job parameters for coin calculation."""
    
    def __init__(self, name: str, w_i: float, d_i: float, t_ideal: float, 
                 t_real: float, p_i: float, s_i: float):
        self.name = name
        self.w_i = w_i  # Work difficulty coefficient
        self.d_i = d_i  # Priority coefficient
        self.t_ideal = t_ideal  # Ideal time
        self.t_real = t_real  # Real time
        self.p_i = p_i  # Demand coefficient
        self.s_i = s_i  # Strategic coefficient


class CoinCalculator:
    """Main class for calculating coin values based on job parameters."""
    
    def __init__(self):
        self.jobs: List[JobParameters] = []
    
    def calculate_coin_value(self, job: JobParameters, time_interval: float = 0.5) -> float:
        """
        Calculate coin value for a job based on the given parameters.
        
        Formula: Coin = (W_i * D_i * P_i * S_i) / (T_real / T_ideal) * time_interval
        
        Args:
            job: JobParameters object containing all coefficients
            time_interval: Time interval in hours (default 0.5 for half hour)
            
        Returns:
            Calculated coin value
        """
        if job.t_ideal <= 0 or job.t_real <= 0:
            raise ValueError("Time values must be greater than 0")
        
        # Time efficiency factor (higher when actual time is less than ideal)
        time_efficiency = job.t_ideal / job.t_real
        
        # Base coin calculation
        base_coin = job.w_i * job.d_i * job.p_i * job.s_i
        
        # Apply time efficiency and interval
        coin_value = base_coin * time_efficiency * time_interval
        
        return round(coin_value, 4)
    
    def add_job(self, job: JobParameters):
        """Add a job to the calculation list."""
        self.jobs.append(job)
    
    def calculate_time_series(self, duration_hours: int = 8) -> List[Tuple[str, Dict[str, float]]]:
        """
        Calculate coin values for each half-hour interval.
        
        Args:
            duration_hours: Total duration in hours
            
        Returns:
            List of tuples (time_string, {job_name: coin_value})
        """
        time_series = []
        current_time = datetime.datetime.now().replace(minute=0, second=0, microsecond=0)
        
        intervals = duration_hours * 2  # Half-hour intervals
        
        for i in range(intervals):
            time_str = current_time.strftime("%H:%M")
            coin_values = {}
            
            for job in self.jobs:
                coin_values[job.name] = self.calculate_coin_value(job)
            
            time_series.append((time_str, coin_values))
            current_time += datetime.timedelta(minutes=30)
        
        return time_series


class TerminalInterface:
    """Terminal interface for user interaction."""
    
    def __init__(self):
        self.calculator = CoinCalculator()
    
    def print_header(self):
        """Print application header."""
        print("=" * 60)
        print("           COIN CALCULATION TERMINAL")
        print("=" * 60)
        print("Bu uygulama iş parametrelerine göre coin değerlerini hesaplar")
        print("ve yarım saatlik dilimler halinde sonuçları gösterir.")
        print("=" * 60)
        print()
    
    def get_float_input(self, prompt: str, min_value: float = 0) -> float:
        """Get validated float input from user."""
        while True:
            try:
                value = float(input(prompt))
                if value <= min_value:
                    print(f"Hata: Değer {min_value}'dan büyük olmalıdır!")
                    continue
                return value
            except ValueError:
                print("Hata: Lütfen geçerli bir sayı giriniz!")
    
    def get_job_parameters(self) -> JobParameters:
        """Get job parameters from user input."""
        print("\n--- Yeni İş Parametreleri ---")
        
        name = input("İş adı: ").strip()
        if not name:
            name = f"İş_{len(self.calculator.jobs) + 1}"
        
        print(f"\n'{name}' işi için parametreleri giriniz:")
        
        w_i = self.get_float_input("İş zorluk katsayısı (W_i): ")
        d_i = self.get_float_input("Öncelik katsayısı (D_i): ")
        t_ideal = self.get_float_input("İdeal süre - saat (T_ideal): ")
        t_real = self.get_float_input("Gerçek süre - saat (T_real): ")
        p_i = self.get_float_input("Talep katsayısı (P_i): ")
        s_i = self.get_float_input("Stratejik katsayı (S_i): ")
        
        return JobParameters(name, w_i, d_i, t_ideal, t_real, p_i, s_i)
    
    def display_job_summary(self):
        """Display summary of all jobs."""
        if not self.calculator.jobs:
            print("Henüz hiç iş eklenmedi.")
            return
        
        print("\n" + "=" * 60)
        print("                   İŞ ÖZETİ")
        print("=" * 60)
        
        for i, job in enumerate(self.calculator.jobs, 1):
            print(f"\n{i}. {job.name}:")
            print(f"   Zorluk: {job.w_i}, Öncelik: {job.d_i}")
            print(f"   İdeal Süre: {job.t_ideal}h, Gerçek Süre: {job.t_real}h")
            print(f"   Talep: {job.p_i}, Stratejik: {job.s_i}")
    
    def display_time_series(self, duration_hours: int = 8):
        """Display coin values as time series."""
        if not self.calculator.jobs:
            print("Coin hesaplaması için önce iş eklemelisiniz!")
            return
        
        time_series = self.calculator.calculate_time_series(duration_hours)
        
        print("\n" + "=" * 80)
        print("                    COIN DEĞERLERİ ZAMAN SERİSİ")
        print("=" * 80)
        print(f"Süre: {duration_hours} saat (yarım saatlik dilimler)")
        print("-" * 80)
        
        # Header
        header = "Zaman".ljust(8)
        for job in self.calculator.jobs:
            header += job.name[:12].ljust(15)
        print(header)
        print("-" * 80)
        
        # Data rows
        for time_str, coin_values in time_series:
            row = time_str.ljust(8)
            for job in self.calculator.jobs:
                coin_value = coin_values.get(job.name, 0)
                row += f"{coin_value:.4f}".ljust(15)
            print(row)
        
        print("-" * 80)
        
        # Summary
        print("\nÖZET:")
        for job in self.calculator.jobs:
            total_coins = sum(coin_values.get(job.name, 0) 
                            for _, coin_values in time_series)
            avg_coins = total_coins / len(time_series)
            print(f"{job.name}: Toplam = {total_coins:.4f}, Ortalama = {avg_coins:.4f}")
    
    def main_menu(self):
        """Display main menu and handle user choices."""
        while True:
            print("\n" + "=" * 40)
            print("           ANA MENÜ")
            print("=" * 40)
            print("1. Yeni iş ekle")
            print("2. İş özetini göster")
            print("3. Coin değerlerini hesapla ve göster")
            print("4. Çıkış")
            print("-" * 40)
            
            choice = input("Seçiminiz (1-4): ").strip()
            
            if choice == "1":
                try:
                    job = self.get_job_parameters()
                    self.calculator.add_job(job)
                    print(f"\n✓ '{job.name}' işi başarıyla eklendi!")
                except KeyboardInterrupt:
                    print("\n\nİşlem iptal edildi.")
                except Exception as e:
                    print(f"\nHata: {e}")
            
            elif choice == "2":
                self.display_job_summary()
            
            elif choice == "3":
                if not self.calculator.jobs:
                    print("\nÖnce en az bir iş eklemelisiniz!")
                    continue
                
                try:
                    duration = int(input("\nKaç saatlik zaman serisi gösterilsin? (varsayılan: 8): ") or "8")
                    if duration <= 0:
                        print("Süre pozitif olmalıdır!")
                        continue
                    self.display_time_series(duration)
                except ValueError:
                    print("Geçerli bir sayı giriniz!")
                except Exception as e:
                    print(f"Hata: {e}")
            
            elif choice == "4":
                print("\nTeşekkürler! Güle güle...")
                break
            
            else:
                print("\nGeçersiz seçim! Lütfen 1-4 arası bir sayı giriniz.")
    
    def run(self):
        """Run the terminal application."""
        try:
            self.print_header()
            self.main_menu()
        except KeyboardInterrupt:
            print("\n\nUygulama kapatılıyor...")
        except Exception as e:
            print(f"\nBeklenmeyen hata: {e}")
            sys.exit(1)


def main():
    """Main entry point of the application."""
    app = TerminalInterface()
    app.run()


if __name__ == "__main__":
    main()