import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { jobsApi, type Job } from "@/services/api";
import { Loader2, Briefcase, MapPin, Clock, Building2, Search, Filter } from "lucide-react";
import { toast } from "sonner";

const CareersPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const params: any = {};
        if (selectedDepartment) params.department = selectedDepartment;
        if (selectedJobType) params.job_type = selectedJobType;
        
        const jobsData = await jobsApi.getAll(params);
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedDepartment, selectedJobType]);

  // Get unique departments and job types for filters
  const departments = Array.from(new Set(jobs.map(job => job.department)));
  const jobTypes: Job['job_type'][] = ['Full-Time', 'Part-Time', 'Internship', 'Contract'];

  // Filter jobs by search term
  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if job deadline has passed
  const isDeadlinePassed = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Briefcase className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Discover exciting career opportunities and build your future with us
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Work With Us?</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We're committed to building a diverse and inclusive team where everyone can thrive. 
              Join us in creating exceptional experiences and making a meaningful impact in the real estate industry.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-white border-b py-6 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Department Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Type Filter */}
              <div className="relative">
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="">All Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading job opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedDepartment || selectedJobType
                  ? "Try adjusting your search or filters."
                  : "We don't have any open positions at the moment. Check back soon!"}
              </p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="mb-6 text-gray-600">
                Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
              </div>
              <div className="grid gap-6">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          to={`/careers/job/${job.id}`}
                          className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2 block"
                        >
                          {job.title}
                        </Link>
                        
                        <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            <span>{job.department}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{job.job_type}</span>
                          </div>
                        </div>

                        {job.deadline && (
                          <div className="text-sm text-gray-500 mb-3">
                            Application Deadline: {new Date(job.deadline).toLocaleDateString()}
                            {isDeadlinePassed(job.deadline) && (
                              <span className="ml-2 text-red-600 font-semibold">(Expired)</span>
                            )}
                          </div>
                        )}
                      </div>

                      <Link
                        to={`/careers/job/${job.id}`}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareersPage;
