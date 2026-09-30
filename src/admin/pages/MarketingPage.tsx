import { motion } from 'framer-motion'
import { Megaphone, TrendingUp, Users, Target } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

export function MarketingPage() {
  return (
    <motion.div 
      className="admin-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader title="Marketing" />

      <div className="admin-grid admin-grid-4">
        <div className="admin-card">
          <div className="admin-card-body text-center">
            <Megaphone size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="admin-card-title">Campaign Management</h3>
            <p className="admin-card-subtitle">Create and manage marketing campaigns</p>
            <div className="mt-4">
              <span className="badge badge-warning">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body text-center">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="admin-card-title">Performance Analytics</h3>
            <p className="admin-card-subtitle">Track campaign performance and ROI</p>
            <div className="mt-4">
              <span className="badge badge-warning">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body text-center">
            <Users size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="admin-card-title">Audience Targeting</h3>
            <p className="admin-card-subtitle">Define and manage target audiences</p>
            <div className="mt-4">
              <span className="badge badge-warning">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-body text-center">
            <Target size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="admin-card-title">Email Marketing</h3>
            <p className="admin-card-subtitle">Send newsletters and promotional emails</p>
            <div className="mt-4">
              <span className="badge badge-warning">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        className="admin-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="admin-card-header">
          <h3 className="admin-card-title">Marketing Features</h3>
          <p className="admin-card-subtitle">Comprehensive marketing tools for growing your platform</p>
        </div>
        <div className="admin-card-body">
          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <Megaphone size={20} />
              </div>
              <div className="feature-content">
                <h4>Promotional Campaigns</h4>
                <p>Create targeted campaigns for films, series, and events</p>
              </div>
              <span className="badge badge-neutral">Planned</span>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <TrendingUp size={20} />
              </div>
              <div className="feature-content">
                <h4>Performance Tracking</h4>
                <p>Monitor impressions, clicks, and conversion rates</p>
              </div>
              <span className="badge badge-neutral">Planned</span>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <Users size={20} />
              </div>
              <div className="feature-content">
                <h4>User Segmentation</h4>
                <p>Target specific user groups based on preferences</p>
              </div>
              <span className="badge badge-neutral">Planned</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <Target size={20} />
              </div>
              <div className="feature-content">
                <h4>Newsletter Integration</h4>
                <p>Send automated updates about new content</p>
              </div>
              <span className="badge badge-neutral">Planned</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-blue-900 mb-2">Interested in Marketing Features?</h4>
            <p className="text-blue-700 text-sm">
              Marketing tools are planned for a future release. Contact your development team 
              to discuss implementation timeline and specific requirements.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}