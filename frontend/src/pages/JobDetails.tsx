import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { jobsApi, type Job } from "@/services/api";
import { Loader2, ArrowLeft, Briefcase, MapPin, Clock, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";
import ApplicationForm from "./ApplicationForm";

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const jobData = await jobsApi.getById(Number(id));
        setJob(jobData);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details. Please try again later.");
        navigate("/careers");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job you're looking for doesn't exist.</p>
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Careers
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isDeadlinePassed = job.deadline 
    ? new Date(job.deadline) < new Date()
    : false;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Careers
          </Link>

          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{job.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span>{job.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{job.job_type}</span>
              </div>
              {job.deadline && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                    {isDeadlinePassed && (
                      <span className="ml-2 text-red-600 font-semibold">(Expired)</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {!isDeadlinePassed && (
              <button
                onClick={() => setShowApplicationForm(true)}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Apply Now
              </button>
            )}
            
            {isDeadlinePassed && (
              <div className="px-6 py-3 bg-red-50 text-red-700 rounded-lg font-semibold">
                This position is no longer accepting applications.
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div 
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: job.description }}
              style={{ lineHeight: '1.8' }}
            />
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Responsibilities</h2>
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                style={{ lineHeight: '1.8' }}
              />
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
                style={{ lineHeight: '1.8' }}
              />
            </div>
          )}

          {/* Application Form Modal */}
          {showApplicationForm && (
            <ApplicationForm
              job={job}
              onClose={() => setShowApplicationForm(false)}
              onSuccess={() => {
                setShowApplicationForm(false);
                toast.success("Application submitted successfully!");
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetails;

