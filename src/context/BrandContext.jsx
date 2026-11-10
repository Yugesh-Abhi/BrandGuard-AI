import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { brandService } from '../services/brandService';
import { contentService } from '../services/contentService';
import { complianceService } from '../services/complianceService';

const BrandContext = createContext(null);

export const BrandProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [brands, setBrands] = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);
  const [guidelines, setGuidelines] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState('sub-101');
  const [activeReport, setActiveReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const fetchedBrands = await brandService.getBrands();
        if (mounted && fetchedBrands.length > 0) {
          setBrands(fetchedBrands);
          const initialBrand = fetchedBrands[0];
          setActiveBrand(initialBrand);

          const fetchedGuidelines = await brandService.getGuidelines(initialBrand.id);
          setGuidelines(fetchedGuidelines);

          const fetchedSubmissions = await contentService.getSubmissions(initialBrand.id);
          setSubmissions(fetchedSubmissions);

          // Default initial report
          const initialReport = await complianceService.getReportById('rep-101');
          setActiveReport(initialReport);
        }
      } catch (err) {
        console.error('Failed to load brand data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const refreshData = async () => {
    if (!activeBrand) return;
    const gList = await brandService.getGuidelines(activeBrand.id);
    setGuidelines(gList);
    const sList = await contentService.getSubmissions(activeBrand.id);
    setSubmissions(sList);
  };

  // Switch active workspace brand
  const switchBrand = async (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;
    setActiveBrand(brand);
    const brandGuidelines = await brandService.getGuidelines(brand.id);
    setGuidelines(brandGuidelines);
    const brandSubmissions = await contentService.getSubmissions(brand.id);
    setSubmissions(brandSubmissions);
  };

  // React Router based navigation helper
  const navigateTo = (view, submissionId = null) => {
    if (submissionId) {
      setActiveSubmissionId(submissionId);
    }
    const cleanView = view.replace(/^\//, '');
    const path = cleanView === 'dashboard' ? '/' : `/${cleanView}`;
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewReportForSubmission = async (submissionId) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (sub && sub.latestReportId) {
      const report = await complianceService.getReportById(sub.latestReportId);
      setActiveReport(report);
      setActiveSubmissionId(submissionId);
      navigate(`/report/${submissionId}`);
    } else {
      setActiveSubmissionId(submissionId);
      navigate('/analysis');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Trigger automated audit with real rule checking
  const runAuditOnText = async ({ title, contentBody, channel, audience, guidelineId }) => {
    setIsScanning(true);
    setScanProgress(15);
    navigate('/analysis');

    const targetGuideline = guidelines.find(g => g.id === guidelineId) || guidelines[0];
    const newSub = await contentService.createSubmission({
      title: title || 'Untitled Marketing Content Draft',
      contentBody,
      channel,
      audience,
      brandId: activeBrand?.id,
      guidelineId: targetGuideline?.id,
      status: 'analyzing'
    });

    setActiveSubmissionId(newSub.id);

    // Multi-stage scan progression
    await new Promise(r => setTimeout(r, 450));
    setScanProgress(45);
    await new Promise(r => setTimeout(r, 550));
    setScanProgress(75);

    // Run deterministic rule evaluation based on active guidelines
    const report = await complianceService.runComplianceCheck({
      contentBody,
      guideline: targetGuideline,
      channel
    });

    setScanProgress(95);
    await new Promise(r => setTimeout(r, 350));
    setScanProgress(100);

    // Update submission record
    const finalStatus = report.overallScore >= 90 ? 'approved' : 'needs_revision';
    await contentService.updateSubmissionStatus(newSub.id, finalStatus, report.overallScore);
    const refreshed = await contentService.getSubmissions(activeBrand?.id);
    setSubmissions(refreshed);

    setActiveReport(report);
    setIsScanning(false);
    navigate(`/report/${newSub.id}`);
  };

  // Guideline CRUD methods
  const addGuidelineRule = async (ruleData) => {
    if (!guidelines[0]) return;
    const updated = await brandService.addRule(guidelines[0].id, ruleData);
    if (updated) {
      await refreshData();
    }
    return updated;
  };

  const updateGuidelineRule = async (ruleKey, updatedData) => {
    if (!guidelines[0]) return;
    const updated = await brandService.updateRule(guidelines[0].id, ruleKey, updatedData);
    if (updated) {
      await refreshData();
    }
    return updated;
  };

  const deleteGuidelineRule = async (ruleKey, category) => {
    if (!guidelines[0]) return;
    const updated = await brandService.deleteRule(guidelines[0].id, ruleKey, category);
    if (updated) {
      await refreshData();
    }
    return updated;
  };

  const resetGuidelineRules = async () => {
    if (!activeBrand) return;
    const reset = await brandService.resetGuidelines(activeBrand.id);
    setGuidelines(reset);
    return reset;
  };

  // Apply suggested correction to active report & submission
  const applyCorrection = async (violationId) => {
    if (!activeReport) return null;
    const violation = (activeReport.violations || []).find(v => v.id === violationId);
    if (!violation || !violation.flaggedText || !violation.suggestedFix) return null;

    const currentSub = submissions.find(s => s.id === activeSubmissionId);
    const originalText = currentSub?.contentBody || activeSubmission?.contentBody || '';

    // Replace flagged text with suggested fix
    const regex = new RegExp(`\\b${violation.flaggedText}\\b`, 'i');
    const updatedContent = originalText.replace(regex, violation.suggestedFix);

    // Remove violation and recalculate
    const remainingViolations = activeReport.violations.filter(v => v.id !== violationId);
    const scoreBoost = violation.severity === 'critical' ? 14 : violation.severity === 'warning' ? 8 : 4;
    const newScore = Math.min(99, activeReport.overallScore + scoreBoost);

    const updatedReport = {
      ...activeReport,
      overallScore: newScore,
      grade: newScore >= 90 ? 'A' : newScore >= 80 ? 'B' : newScore >= 70 ? 'C' : 'F',
      verdict: newScore >= 90 ? 'Passed — Ready for Publication' : 'Needs Minor Revisions Before Approval',
      violations: remainingViolations
    };

    complianceService.saveReport(updatedReport);
    setActiveReport(updatedReport);

    if (currentSub) {
      await contentService.updateSubmission(currentSub.id, {
        contentBody: updatedContent,
        complianceScore: newScore,
        status: newScore >= 90 ? 'approved' : 'needs_revision'
      });
      await refreshData();
    }

    return updatedReport;
  };

  // Submit active item to Brand Review Queue
  const submitToReviewQueue = async (submissionId) => {
    const sub = submissions.find(s => s.id === submissionId) || activeSubmission;
    if (!sub) return null;
    const reviewItem = await contentService.queueSubmissionForReview(sub, activeReport?.overallScore);
    await refreshData();
    return reviewItem;
  };

  const activeSubmission = submissions.find(s => s.id === activeSubmissionId) || submissions[0] || null;

  return (
    <BrandContext.Provider value={{
      brands,
      activeBrand,
      switchBrand,
      guidelines,
      submissions,
      navigateTo,
      activeSubmission,
      activeSubmissionId,
      setActiveSubmissionId,
      activeReport,
      setActiveReport,
      viewReportForSubmission,
      runAuditOnText,
      isScanning,
      scanProgress,
      loading,
      addGuidelineRule,
      updateGuidelineRule,
      deleteGuidelineRule,
      resetGuidelineRules,
      applyCorrection,
      submitToReviewQueue,
      refreshData,
      currentPath: location.pathname
    }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within a BrandProvider');
  return ctx;
};
