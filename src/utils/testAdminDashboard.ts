/**
 * Admin Dashboard Integration Test Utility
 * 
 * This utility helps test the admin dashboard integration with the new backend API
 * based on the Admin Dashboard Integration Guide provided.
 */

import { adminApi } from '../services'
import type { AdminDashboardStats } from '../services'

export class AdminDashboardTester {
  /**
   * Test the dashboard stats endpoint with different periods
   */
  static async testDashboardStats() {
    console.log('🧪 Testing Admin Dashboard Integration...')
    
    const periods = ['day', 'week', 'month', 'year']
    const results: Record<string, any> = {}
    
    for (const period of periods) {
      try {
        console.log(`📊 Testing ${period} period...`)
        
        const stats = await adminApi.getDashboardStats({ period })
        results[period] = {
          success: true,
          data: stats,
          dataStructure: this.analyzeDataStructure(stats)
        }
        
        console.log(`✅ ${period} period - Success`)
        console.log(`   - Order Stats: ${JSON.stringify(stats.orderStats)}`)
        console.log(`   - Sales Summary: ${stats.salesSummary?.totalSales}`)
        console.log(`   - User Stats: ${stats.userStats?.totalUsers} users`)
        console.log(`   - Product Stats: ${stats.productStats?.totalProducts} products`)
        console.log(`   - Recent Orders: ${stats.recentOrders?.length} items`)
        console.log(`   - Recent Reviews: ${stats.recentReviews?.length} items`)
        console.log(`   - Sales Chart: ${stats.salesChart?.labels?.length} data points`)
        
      } catch (error) {
        console.error(`❌ ${period} period - Failed:`, error)
        results[period] = {
          success: false,
          error: error instanceof Error ? error.message : String(error)
        }
      }
    }
    
    return results
  }
  
  /**
   * Test custom date range functionality
   */
  static async testCustomDateRange() {
    console.log('📅 Testing custom date range...')
    
    try {
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const stats = await adminApi.getDashboardStats({
        startDate,
        endDate
      })
      
      console.log('✅ Custom date range - Success')
      console.log(`   - Date Range: ${startDate.split('T')[0]} to ${endDate.split('T')[0]}`)
      console.log(`   - Total Sales: ${stats.salesSummary?.totalSales}`)
      console.log(`   - Order Count: ${stats.salesSummary?.orderCount}`)
      
      return { success: true, data: stats }
    } catch (error) {
      console.error('❌ Custom date range - Failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }
    }
  }
  
  /**
   * Analyze the data structure to ensure it matches the expected format
   */
  private static analyzeDataStructure(stats: AdminDashboardStats) {
    const analysis = {
      hasOrderStats: !!stats.orderStats,
      orderStatsKeys: stats.orderStats ? Object.keys(stats.orderStats) : [],
      hasSalesSummary: !!stats.salesSummary,
      salesSummaryKeys: stats.salesSummary ? Object.keys(stats.salesSummary) : [],
      hasUserStats: !!stats.userStats,
      userStatsKeys: stats.userStats ? Object.keys(stats.userStats) : [],
      hasProductStats: !!stats.productStats,
      productStatsKeys: stats.productStats ? Object.keys(stats.productStats) : [],
      hasRecentOrders: Array.isArray(stats.recentOrders),
      recentOrdersCount: stats.recentOrders?.length || 0,
      hasRecentReviews: Array.isArray(stats.recentReviews),
      recentReviewsCount: stats.recentReviews?.length || 0,
      hasSalesChart: !!stats.salesChart,
      salesChartKeys: stats.salesChart ? Object.keys(stats.salesChart) : [],
      salesChartDataPoints: stats.salesChart?.data?.length || 0
    }
    
    return analysis
  }
  
  /**
   * Validate that the response matches the expected structure from the guide
   */
  static validateDataStructure(stats: AdminDashboardStats): { isValid: boolean; issues: string[] } {
    const issues: string[] = []
    
    // Check required order stats
    if (!stats.orderStats) {
      issues.push('Missing orderStats')
    } else {
      const requiredOrderFields = ['pending', 'paid', 'completed', 'cancelled']
      for (const field of requiredOrderFields) {
        if (!(field in stats.orderStats)) {
          issues.push(`Missing orderStats.${field}`)
        }
      }
    }
    
    // Check sales summary
    if (!stats.salesSummary) {
      issues.push('Missing salesSummary')
    } else {
      const requiredSalesFields = ['totalSales', 'orderCount', 'comparisonPeriod']
      for (const field of requiredSalesFields) {
        if (!(field in stats.salesSummary)) {
          issues.push(`Missing salesSummary.${field}`)
        }
      }
    }
    
    // Check user stats
    if (!stats.userStats) {
      issues.push('Missing userStats')
    } else {
      const requiredUserFields = ['totalUsers', 'newUsers']
      for (const field of requiredUserFields) {
        if (!(field in stats.userStats)) {
          issues.push(`Missing userStats.${field}`)
        }
      }
    }
    
    // Check product stats
    if (!stats.productStats) {
      issues.push('Missing productStats')
    } else {
      const requiredProductFields = ['totalProducts', 'lowStock', 'outOfStock', 'topSelling']
      for (const field of requiredProductFields) {
        if (!(field in stats.productStats)) {
          issues.push(`Missing productStats.${field}`)
        }
      }
    }
    
    // Check arrays
    if (!Array.isArray(stats.recentOrders)) {
      issues.push('recentOrders should be an array')
    }
    
    if (!Array.isArray(stats.recentReviews)) {
      issues.push('recentReviews should be an array')
    }
    
    // Check sales chart
    if (!stats.salesChart) {
      issues.push('Missing salesChart')
    } else {
      if (!Array.isArray(stats.salesChart.labels)) {
        issues.push('salesChart.labels should be an array')
      }
      if (!Array.isArray(stats.salesChart.data)) {
        issues.push('salesChart.data should be an array')
      }
    }
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }
  
  /**
   * Generate a comprehensive test report
   */
  static async generateTestReport() {
    console.log('📋 Generating comprehensive admin dashboard test report...')
    
    const report = {
      timestamp: new Date().toISOString(),
      tests: {
        periodTests: await this.testDashboardStats(),
        customDateRange: await this.testCustomDateRange()
      },
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    }
    
    // Calculate summary
    const allTests = [
      ...Object.values(report.tests.periodTests),
      report.tests.customDateRange
    ]
    
    report.summary.totalTests = allTests.length
    report.summary.passedTests = allTests.filter(test => test.success).length
    report.summary.failedTests = allTests.filter(test => !test.success).length
    
    console.log('📊 Test Summary:')
    console.log(`   Total Tests: ${report.summary.totalTests}`)
    console.log(`   Passed: ${report.summary.passedTests}`)
    console.log(`   Failed: ${report.summary.failedTests}`)
    console.log(`   Success Rate: ${((report.summary.passedTests / report.summary.totalTests) * 100).toFixed(1)}%`)
    
    return report
  }
}

// Export a simple test function for console usage
export const testAdminDashboard = () => AdminDashboardTester.generateTestReport()