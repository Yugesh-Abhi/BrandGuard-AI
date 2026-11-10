import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Eye
} from 'lucide-react';
import { useBrand } from '../../context/BrandContext';
import { contentService } from '../../services/contentService';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export const ReviewApprovalPage = () => {
  const { viewReportForSubmission, refreshData } = useBrand();

  const [queue, setQueue] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'revisions' | 'approved' | 'rejected'
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: 'approve' });
  const [commentText, setCommentText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const loadQueue = React.useCallback(async () => {
    const data = await contentService.getReviewQueue();
    setQueue(data);
    setSelectedReview((prev) => prev || (data.length > 0 ? data[0] : null));
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleAction = async () => {
    if (!selectedReview) return;
    await contentService.updateReviewStatus(selectedReview.id, actionModal.type, commentText);
    await refreshData();
    await loadQueue();

    const actionLabel =
      actionModal.type === 'approve' ? 'Approved for Publishing' :
      actionModal.type === 'reject' ? 'Rejected' :
      'Revision Requested';

    setToastMessage(`Submission marked as ${actionLabel}!`);
    setTimeout(() => setToastMessage(''), 3000);
    setActionModal({ open: false, type: 'approve' });
    setCommentText('');
  };

  const filtered = queue.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return item.status === 'In Review';
    if (filter === 'approved') return item.status === 'Approved';
    if (filter === 'revisions') return item.status === 'Needs Revisions';
    if (filter === 'rejected') return item.status === 'Rejected';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1A2346]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Review & Approval Workflows</h2>
          <p className="text-xs text-slate-400 mt-1">
            Brand Governance queue for reviewing automated compliance findings and granting publishing sign-offs.
          </p>
        </div>

        {toastMessage && (
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-4 h-4" /> {toastMessage}
          </div>
        )}
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0B0F20] border border-[#192348] w-fit overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Items ({queue.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'pending' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Pending Review ({queue.filter(q => q.status === 'In Review').length})
        </button>
        <button
          onClick={() => setFilter('revisions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'revisions' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Needs Revisions ({queue.filter(q => q.status === 'Needs Revisions').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'approved' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Approved ({queue.filter(q => q.status === 'Approved').length})
        </button>
      </div>

      {/* Main Grid: Queue List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: Queue items */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#0D1326] border border-[#1C264D] text-slate-400 text-xs">
              No review items found for this status.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedReview?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReview(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121935] border-purple-500/60 shadow-lg shadow-purple-950/30'
                      : 'bg-[#0D1326] border-[#1C264D] hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                      {item.channel}
                    </span>
                    <Badge variant={item.status}>{item.status}</Badge>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-white tracking-tight line-clamp-2">
                    {item.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-[#161E38]">
                    <span>By: {item.author}</span>
                    <span className="font-mono text-purple-300 font-bold">
                      Score: {item.complianceScore}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Review & Decision Inspector */}
        <div className="lg:col-span-7">
          {selectedReview ? (
            <Card padding="p-6" className="space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-[#1A2346] gap-3">
                <div>
                  <Badge variant={selectedReview.status}>{selectedReview.status}</Badge>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-2">
                    {selectedReview.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted by <strong className="text-slate-300">{selectedReview.author}</strong> • {selectedReview.submittedAgo}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => viewReportForSubmission(selectedReview.submissionId)}
                  className="text-xs shrink-0"
                >
                  Inspect Report
                </Button>
              </div>

              {/* Review Routing Info */}
              <div className="p-3.5 rounded-xl bg-[#090D1C] border border-[#161D3A] text-xs space-y-1">
                <p className="text-slate-400">
                  Assigned Authority: <strong className="text-purple-300">{selectedReview.pendingWith}</strong>
                </p>
                <p className="text-slate-400">
                  Priority SLA: <strong className="text-amber-300">{selectedReview.priority || 'Normal'}</strong>
                </p>
              </div>

              {/* Decision Action Buttons */}
              <div className="p-4 rounded-xl bg-[#0E152E] border border-[#1E294B] space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Brand Governance Decisions
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={CheckCircle2}
                    onClick={() => setActionModal({ open: true, type: 'approve' })}
                    className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40 text-xs"
                  >
                    Approve for Publishing
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={AlertTriangle}
                    onClick={() => setActionModal({ open: true, type: 'request_revision' })}
                    className="text-amber-300 border-amber-500/30 text-xs"
                  >
                    Request Adjustments
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    icon={XCircle}
                    onClick={() => setActionModal({ open: true, type: 'reject' })}
                    className="text-xs"
                  >
                    Reject Copy
                  </Button>
                </div>
              </div>

              {/* Reviewer Feedback Notes Thread */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> Reviewer Notes & Audit Trail
                </span>

                <div className="p-3 rounded-xl bg-[#090D1C] border border-[#161D3A] text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-semibold text-purple-300">Brand Governance Engine</span>
                    <span>Automated</span>
                  </div>
                  <p className="text-slate-300">
                    Preliminary scan complete with a compliance index of {selectedReview.complianceScore}%. Terminology and liability warnings flagged for review.
                  </p>
                </div>

                {selectedReview.lastComment && (
                  <div className="p-3 rounded-xl bg-[#121935] border border-purple-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="font-semibold text-purple-300">
                        {selectedReview.reviewedBy || 'Brand Director Sign-off'}
                      </span>
                      <span>Latest Update</span>
                    </div>
                    <p className="text-slate-200 italic">
                      "{selectedReview.lastComment}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select an item from the queue to review and grant approval.
            </div>
          )}
        </div>

      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={actionModal.open}
        onClose={() => setActionModal({ open: false, type: 'approve' })}
        title={
          actionModal.type === 'approve'
            ? 'Confirm Publishing Approval'
            : actionModal.type === 'reject'
            ? 'Reject Content'
            : 'Request Required Adjustments'
        }
        subtitle={selectedReview?.title}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            {actionModal.type === 'approve'
              ? 'This certifies that the content adheres to brand voice guidelines and legal SLA requirements.'
              : 'Provide specific feedback explaining what adjustments are required before this piece can be certified.'}
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Reviewer Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add specific comments or guidance for the author..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full bg-[#111833] border border-[#1E294B] rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#1A2346]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActionModal({ open: false, type: 'approve' })}
            >
              Cancel
            </Button>
            <Button
              variant={actionModal.type === 'approve' ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleAction}
            >
              Confirm Decision
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
