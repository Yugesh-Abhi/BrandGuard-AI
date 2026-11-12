
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

import { organisationService } from '../services/organisationService';
import { brandService } from '../services/brandService';
import { contentService } from '../services/contentService';
import { complianceService } from '../services/complianceService';

const BrandContext = createContext(null);

export const BrandProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const isDemoUser = Boolean(user?.isMock);

  const activeOrganisationId = isDemoUser
    ? null
    : organisationService.getActiveOrganisationId();

  const [brands, setBrands] = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);
  const [guidelines, setGuidelines] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBrandData = useCallback(async () => {
    if (!user) {
      setBrands([]);
      setActiveBrand(null);
      setGuidelines([]);
      setSubmissions([]);
      setActiveReport(null);
      setActiveSubmissionId(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const fetchedBrands = await brandService.getBrands(
        activeOrganisationId,
        { allowMock: isDemoUser }
      );

      setBrands(fetchedBrands);

      if (!fetchedBrands.length) {
        setActiveBrand(null);
        setGuidelines([]);
        setSubmissions([]);
        setActiveReport(null);
        setActiveSubmissionId(null);
        return;
      }

      const initialBrand =
        fetchedBrands.find(
          brand => brand.id === activeBrand?.id
        ) || fetchedBrands[0];

      setActiveBrand(initialBrand);

      const [fetchedGuidelines, fetchedSubmissions] =
        await Promise.all([
          brandService.getGuidelines(
            initialBrand.id,
            { allowMock: isDemoUser }
          ),
          contentService.getSubmissions(initialBrand.id)
        ]);

      setGuidelines(fetchedGuidelines);
      setSubmissions(fetchedSubmissions);

      const firstSubmission = fetchedSubmissions[0] || null;

      setActiveSubmissionId(firstSubmission?.id || null);

      if (isDemoUser) {
        const initialReport =
          await complianceService.getReportById('rep-101');

        setActiveReport(initialReport);
      } else if (firstSubmission) {
        const latestReport =
          await complianceService.getLatestReportForSubmission(
            firstSubmission.id
          );

        setActiveReport(latestReport);
      } else {
        setActiveReport(null);
      }
    } catch (err) {
      console.error('Failed to load brand data:', err);

      setBrands([]);
      setActiveBrand(null);
      setGuidelines([]);
      setSubmissions([]);
      setActiveReport(null);
      setActiveSubmissionId(null);
    } finally {
      setLoading(false);
    }
  }, [
    user?.id,
    isDemoUser,
    activeOrganisationId
  ]);

  useEffect(() => {
    if (authLoading) return;
    loadBrandData();
  }, [authLoading, loadBrandData]);

  const refreshData = async () => {
    if (!activeBrand) return;

    const [updatedGuidelines, updatedSubmissions] =
      await Promise.all([
        brandService.getGuidelines(
          activeBrand.id,
          { allowMock: isDemoUser }
        ),
        contentService.getSubmissions(activeBrand.id)
      ]);

    setGuidelines(updatedGuidelines);
    setSubmissions(updatedSubmissions);
  };

  const switchBrand = async (brandId) => {
    const brand = brands.find(item => item.id === brandId);

    if (!brand) return;

    setActiveBrand(brand);
    setActiveReport(null);
    setActiveSubmissionId(null);

    try {
      const [brandGuidelines, brandSubmissions] =
        await Promise.all([
          brandService.getGuidelines(
            brand.id,
            { allowMock: isDemoUser }
          ),
          contentService.getSubmissions(brand.id)
        ]);

      setGuidelines(brandGuidelines);
      setSubmissions(brandSubmissions);

      const firstSubmission = brandSubmissions[0] || null;

      if (firstSubmission) {
        setActiveSubmissionId(firstSubmission.id);

        if (isDemoUser) {
          setActiveReport(
            await complianceService.getReportById('rep-101')
          );
        } else {
          setActiveReport(
            await complianceService.getLatestReportForSubmission(
              firstSubmission.id
            )
          );
        }
      }
    } catch (err) {
      console.error('Failed to switch brand:', err);
      throw err;
    }
  };

  const navigateTo = (view, submissionId = null) => {
    if (submissionId) {
      setActiveSubmissionId(submissionId);
    }

    const cleanView = String(view || '')
      .replace(/^\/+|\/+$/g, '');

    const path =
      !cleanView || cleanView === 'dashboard'
        ? '/'
        : `/${cleanView}`;

    navigate(path);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const viewReportForSubmission = async (submissionId) => {
    setActiveSubmissionId(submissionId);

    try {
      let report = null;

      if (isDemoUser) {
        const submission = submissions.find(
          item => item.id === submissionId
        );

        if (submission?.latestReportId) {
          report = await complianceService.getReportById(
            submission.latestReportId
          );
        }
      } else {
        report =
          await complianceService.getLatestReportForSubmission(
            submissionId
          );
      }

      if (report) {
        setActiveReport(report);
        navigate(`/report/${submissionId}`);
      } else {
        setActiveReport(null);
        navigate('/analysis');
      }
    } catch (err) {
      console.error('Failed to retrieve compliance report:', err);
      throw err;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const runAuditOnText = async ({
    title,
    contentBody,
    channel,
    audience,
    guidelineId
  }) => {
    if (!activeBrand) {
      throw new Error(
        'Please create or select a brand before running an audit.'
      );
    }

    setIsScanning(true);
    setScanProgress(0);
    navigate('/analysis');

    try {
      const targetGuideline =
        guidelines.find(item => item.id === guidelineId) ||
        guidelines[0] ||
        null;

      if (!targetGuideline) {
        throw new Error(
          'No active brand guideline is available for this brand.'
        );
      }

      setScanProgress(15);

      const newSubmission =
        await contentService.createSubmission({
          title: title || 'Untitled Marketing Content Draft',
          contentBody,
          channel,
          audience,
          brandId: activeBrand.id,
          guidelineId: targetGuideline.id,
          status: 'analyzing'
        });

      setActiveSubmissionId(newSubmission.id);

      await new Promise(resolve => setTimeout(resolve, 450));
      setScanProgress(45);

      await new Promise(resolve => setTimeout(resolve, 550));
      setScanProgress(75);

      const report =
        await complianceService.runComplianceCheck({
          contentBody,
          guideline: targetGuideline,
          channel,
          submissionId: isDemoUser
            ? null
            : newSubmission.id
        });

      setScanProgress(95);

      const finalStatus =
        report.overallScore >= 90
          ? 'approved'
          : 'needs_revision';

      await contentService.updateSubmissionStatus(
        newSubmission.id,
        finalStatus,
        report.overallScore
      );

      const refreshedSubmissions =
        await contentService.getSubmissions(activeBrand.id);

      setSubmissions(refreshedSubmissions);
      setActiveReport(report);
      setScanProgress(100);

      navigate(`/report/${newSubmission.id}`);

      return report;
    } catch (err) {
      console.error('Compliance audit failed:', err);
      throw err;
    } finally {
      setIsScanning(false);
    }
  };

  const requireDemoRuleEditing = () => {
    if (!isDemoUser) {
      throw new Error(
        'Database rule editing is not connected yet. Your real workspace data has not been changed.'
      );
    }
  };

  const addGuidelineRule = async (ruleData) => {
    requireDemoRuleEditing();

    if (!guidelines[0]) return null;

    const updated = await brandService.addRule(
      guidelines[0].id,
      ruleData
    );

    if (updated) await refreshData();

    return updated;
  };

  const updateGuidelineRule = async (
    ruleKey,
    updatedData
  ) => {
    requireDemoRuleEditing();

    if (!guidelines[0]) return null;

    const updated = await brandService.updateRule(
      guidelines[0].id,
      ruleKey,
      updatedData
    );

    if (updated) await refreshData();

    return updated;
  };

  const deleteGuidelineRule = async (
    ruleKey,
    category
  ) => {
    requireDemoRuleEditing();

    if (!guidelines[0]) return null;

    const updated = await brandService.deleteRule(
      guidelines[0].id,
      ruleKey,
      category
    );

    if (updated) await refreshData();

    return updated;
  };

  const resetGuidelineRules = async () => {
    requireDemoRuleEditing();

    if (!activeBrand) return null;

    const reset = await brandService.resetGuidelines(
      activeBrand.id
    );

    setGuidelines(reset);

    return reset;
  };

  const activeSubmission =
    submissions.find(
      item => item.id === activeSubmissionId
    ) || submissions[0] || null;

  // Apply a correction, save a revision, and run a fresh compliance audit.
  const applyCorrection = async (violationId) => {
    if (!activeReport) {
      throw new Error('No compliance report is currently selected.');
    }

    if (isScanning) {
      throw new Error('A compliance scan is already in progress.');
    }

    const violation = (
      activeReport.violations || []
    ).find(item => item.id === violationId);

    if (
      !violation ||
      !violation.flaggedText ||
      !violation.suggestedFix
    ) {
      throw new Error(
        'This violation does not have a usable suggested correction.'
      );
    }

    const currentSubmission = submissions.find(
      item => item.id === activeSubmissionId
    ) || activeSubmission;

    if (!currentSubmission) {
      throw new Error('The related content submission could not be found.');
    }

    const targetGuideline =
      guidelines.find(
        item => item.id === currentSubmission.guidelineId
      ) || guidelines[0];

    if (!targetGuideline) {
      throw new Error('The brand guideline for this submission could not be found.');
    }

    const originalText = currentSubmission.contentBody || '';

    const escapedText = violation.flaggedText.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    const regex = new RegExp(escapedText, 'i');

    if (!regex.test(originalText)) {
      throw new Error(
        'The flagged text could not be found in the current content. Please refresh the report and try again.'
      );
    }

    const updatedContent = originalText.replace(
      regex,
      violation.suggestedFix
    );

    setIsScanning(true);
    setScanProgress(10);

    try {
      // Save the changed content first. The content service records
      // the previous version in revision_history.
      await contentService.updateSubmission(
        currentSubmission.id,
        {
          contentBody: updatedContent,
          status: 'analyzing'
        }
      );

      setScanProgress(35);

      // Re-run the actual compliance rules against the revised content.
      const updatedReport =
        await complianceService.runComplianceCheck({
          contentBody: updatedContent,
          guideline: targetGuideline,
          channel: currentSubmission.channel || 'Blog Post',
          submissionId: isDemoUser
            ? null
            : currentSubmission.id
        });

      setScanProgress(85);

      const finalStatus =
        updatedReport.overallScore >= 90
          ? 'approved'
          : 'needs_revision';

      // Store the newly calculated score and status.
      await contentService.updateSubmissionStatus(
        currentSubmission.id,
        finalStatus,
        updatedReport.overallScore
      );

      const refreshedSubmissions =
        await contentService.getSubmissions(activeBrand.id);

      setSubmissions(refreshedSubmissions);
      setActiveSubmissionId(currentSubmission.id);
      setActiveReport(updatedReport);

      setScanProgress(100);

      return updatedReport;
    } catch (err) {
      console.error('Correction and re-audit failed:', err);
      throw err;
    } finally {
      setIsScanning(false);
    }
  };

  const submitToReviewQueue = async (submissionId) => {
    const submission = submissions.find(
      item => item.id === submissionId
    ) || activeSubmission;

    if (!submission) return null;

    const reviewItem =
      await contentService.queueSubmissionForReview(
        submission,
        activeReport?.overallScore
      );

    await refreshData();

    return reviewItem;
  };

  return (
    <BrandContext.Provider
      value={{
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
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);

  if (!context) {
    throw new Error(
      'useBrand must be used within a BrandProvider'
    );
  }

  return context;
};
