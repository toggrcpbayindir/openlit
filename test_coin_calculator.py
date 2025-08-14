#!/usr/bin/env python3
"""
Unit tests for Coin Calculator

Tests the core functionality of the coin calculation algorithm.
"""

import sys
import unittest
from coin_calculator import CoinCalculator, JobParameters


class TestCoinCalculator(unittest.TestCase):
    """Test cases for CoinCalculator class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.calculator = CoinCalculator()
        self.sample_job = JobParameters(
            name="Test Job",
            w_i=2.0,    # Work difficulty
            d_i=1.5,    # Priority
            t_ideal=4.0, # Ideal time
            t_real=3.0,  # Real time
            p_i=1.2,    # Demand
            s_i=1.8     # Strategic
        )
    
    def test_coin_calculation_basic(self):
        """Test basic coin calculation."""
        expected = (2.0 * 1.5 * 1.2 * 1.8) * (4.0 / 3.0) * 0.5
        result = self.calculator.calculate_coin_value(self.sample_job)
        self.assertAlmostEqual(result, expected, places=4)
    
    def test_coin_calculation_time_efficiency(self):
        """Test time efficiency factor."""
        # Job completed faster than ideal (efficiency > 1)
        fast_job = JobParameters("Fast", 1.0, 1.0, 4.0, 2.0, 1.0, 1.0)
        fast_result = self.calculator.calculate_coin_value(fast_job)
        
        # Job completed slower than ideal (efficiency < 1)
        slow_job = JobParameters("Slow", 1.0, 1.0, 2.0, 4.0, 1.0, 1.0)
        slow_result = self.calculator.calculate_coin_value(slow_job)
        
        # Fast job should get more coins than slow job
        self.assertGreater(fast_result, slow_result)
    
    def test_coin_calculation_different_intervals(self):
        """Test coin calculation with different time intervals."""
        result_half_hour = self.calculator.calculate_coin_value(self.sample_job, 0.5)
        result_one_hour = self.calculator.calculate_coin_value(self.sample_job, 1.0)
        
        # One hour should be exactly double of half hour
        self.assertAlmostEqual(result_one_hour, result_half_hour * 2, places=4)
    
    def test_invalid_time_values(self):
        """Test error handling for invalid time values."""
        # Zero ideal time
        with self.assertRaises(ValueError):
            invalid_job = JobParameters("Invalid", 1.0, 1.0, 0.0, 1.0, 1.0, 1.0)
            self.calculator.calculate_coin_value(invalid_job)
        
        # Negative real time
        with self.assertRaises(ValueError):
            invalid_job = JobParameters("Invalid", 1.0, 1.0, 1.0, -1.0, 1.0, 1.0)
            self.calculator.calculate_coin_value(invalid_job)
    
    def test_add_job(self):
        """Test adding jobs to calculator."""
        initial_count = len(self.calculator.jobs)
        self.calculator.add_job(self.sample_job)
        self.assertEqual(len(self.calculator.jobs), initial_count + 1)
        self.assertEqual(self.calculator.jobs[-1].name, "Test Job")
    
    def test_time_series_generation(self):
        """Test time series generation."""
        self.calculator.add_job(self.sample_job)
        
        # Test 2 hours (4 intervals)
        time_series = self.calculator.calculate_time_series(2)
        self.assertEqual(len(time_series), 4)
        
        # Check structure of each entry
        for time_str, coin_values in time_series:
            self.assertIsInstance(time_str, str)
            self.assertIn("Test Job", coin_values)
            self.assertIsInstance(coin_values["Test Job"], float)
    
    def test_time_series_multiple_jobs(self):
        """Test time series with multiple jobs."""
        job1 = JobParameters("Job1", 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)
        job2 = JobParameters("Job2", 2.0, 2.0, 2.0, 2.0, 2.0, 2.0)
        
        self.calculator.add_job(job1)
        self.calculator.add_job(job2)
        
        time_series = self.calculator.calculate_time_series(1)
        
        for time_str, coin_values in time_series:
            self.assertIn("Job1", coin_values)
            self.assertIn("Job2", coin_values)
            # Job2 should have higher coin value due to higher coefficients
            self.assertGreater(coin_values["Job2"], coin_values["Job1"])
    
    def test_coin_value_precision(self):
        """Test coin value precision and rounding."""
        result = self.calculator.calculate_coin_value(self.sample_job)
        # Should be rounded to 4 decimal places max
        decimal_places = len(str(result).split('.')[-1]) if '.' in str(result) else 0
        self.assertLessEqual(decimal_places, 4)


class TestJobParameters(unittest.TestCase):
    """Test cases for JobParameters class."""
    
    def test_job_creation(self):
        """Test job parameter creation."""
        job = JobParameters("Test", 1.0, 2.0, 3.0, 4.0, 5.0, 6.0)
        
        self.assertEqual(job.name, "Test")
        self.assertEqual(job.w_i, 1.0)
        self.assertEqual(job.d_i, 2.0)
        self.assertEqual(job.t_ideal, 3.0)
        self.assertEqual(job.t_real, 4.0)
        self.assertEqual(job.p_i, 5.0)
        self.assertEqual(job.s_i, 6.0)


def run_tests():
    """Run all tests and return results."""
    print("=" * 60)
    print("           COIN CALCULATOR UNIT TESTS")
    print("=" * 60)
    
    # Run tests
    suite = unittest.TestLoader().loadTestsFromModule(sys.modules[__name__])
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "=" * 60)
    if result.wasSuccessful():
        print("✅ Tüm testler başarılı!")
        print(f"Toplam test: {result.testsRun}")
    else:
        print("❌ Bazı testler başarısız!")
        print(f"Toplam test: {result.testsRun}")
        print(f"Başarısız: {len(result.failures)}")
        print(f"Hata: {len(result.errors)}")
    print("=" * 60)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    run_tests()