"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCompanyDocuments,
  getCompanyDocumentView,
} from "@/lib/api";


export default function DocumentsPage() {
  const [
    documents,
    setDocuments,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    sectionFilter,
    setSectionFilter,
  ] = useState("ALL");

  const [
    openingId,
    setOpeningId,
  ] = useState(null);


  useEffect(() => {
    async function loadDocuments() {
      try {
        setError("");

        const data =
          await getCompanyDocuments();

        setDocuments(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {
        setError(
          err?.message ||
            "Unable to load secure documents."
        );

      } finally {
        setLoading(false);
      }
    }


    loadDocuments();
  }, []);


  const sections =
    useMemo(
      () => {
        return [
          ...new Set(
            documents
              .map(
                (document) =>
                  document.section
              )
              .filter(Boolean)
          ),
        ];
      },
      [
        documents,
      ]
    );


  const filteredDocuments =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();


        return documents.filter(
          (document) => {
            const matchesSection =
              sectionFilter ===
                "ALL" ||
              document.section ===
                sectionFilter;


            const candidateName =
              (
                document.candidate_name ||
                ""
              ).toLowerCase();


            const candidateEmail =
              (
                document.candidate_email ||
                ""
              ).toLowerCase();


            const filename =
              (
                document.original_filename ||
                ""
              ).toLowerCase();


            const matchesSearch =
              !normalizedSearch ||
              candidateName.includes(
                normalizedSearch
              ) ||
              candidateEmail.includes(
                normalizedSearch
              ) ||
              filename.includes(
                normalizedSearch
              );


            return (
              matchesSection &&
              matchesSearch
            );
          }
        );
      },
      [
        documents,
        search,
        sectionFilter,
      ]
    );


  const metrics =
    useMemo(
      () => {
        const uploaded =
          documents.filter(
            (document) =>
              document.status ===
              "UPLOADED"
          ).length;


        const driverLicenses =
          documents.filter(
            (document) =>
              document.section ===
              "DRIVERS_LICENSE"
          ).length;


        const uniqueCandidates =
          new Set(
            documents
              .map(
                (document) =>
                  document.candidate_id
              )
              .filter(Boolean)
          ).size;


        return {
          total:
            documents.length,

          uploaded,

          driverLicenses,

          candidates:
            uniqueCandidates,
        };
      },
      [
        documents,
      ]
    );


  async function handleViewDocument(
    documentId
  ) {
    if (
      !documentId ||
      openingId
    ) {
      return;
    }


    setError("");

    setOpeningId(
      documentId
    );


    try {
      const result =
        await getCompanyDocumentView(
          documentId
        );


      if (!result?.url) {
        throw new Error(
          "Secure document URL was not returned."
        );
      }


      window.open(
        result.url,
        "_blank",
        "noopener,noreferrer"
      );

    } catch (err) {
      setError(
        err?.message ||
          "Unable to open document."
      );

    } finally {
      setOpeningId(
        null
      );
    }
  }


  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading secure documents...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section>

        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-blue-600">
          Secure Document Workspace
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Documents
        </h2>

        <p className="mt-2 text-slate-600">
          Review secure candidate onboarding
          files associated with your company
          workspace.
        </p>

      </section>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}


      {/* =====================================================
          METRICS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <Metric
          label="Total documents"
          value={
            metrics.total
          }
          tone="blue"
        />

        <Metric
          label="Uploaded"
          value={
            metrics.uploaded
          }
          tone="emerald"
        />

        <Metric
          label="Driver's license files"
          value={
            metrics.driverLicenses
          }
          tone="violet"
        />

        <Metric
          label="Candidates"
          value={
            metrics.candidates
          }
          tone="cyan"
        />

      </section>


      {/* =====================================================
          FILTERS
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              value={
                search
              }
              onChange={
                (event) =>
                  setSearch(
                    event.target.value
                  )
              }
              placeholder="Search candidate or filename..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />

          </div>


          {/* FILTER */}

          <div className="flex flex-col gap-3 sm:flex-row">

            <select
              value={
                sectionFilter
              }
              onChange={
                (event) =>
                  setSectionFilter(
                    event.target.value
                  )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400"
            >

              <option value="ALL">
                All sections
              </option>


              {sections.map(
                (section) => (
                  <option
                    key={
                      section
                    }
                    value={
                      section
                    }
                  >
                    {
                      formatSection(
                        section
                      )
                    }
                  </option>
                )
              )}

            </select>


            <div className="flex items-center rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">

              {
                filteredDocuments.length
              }{" "}

              file
              {
                filteredDocuments.length ===
                  1
                  ? ""
                  : "s"
              }

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          DOCUMENT REGISTRY
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h3 className="text-lg font-semibold text-slate-950">
              Secure file registry
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Metadata for candidate files
              securely stored during onboarding.
            </p>

          </div>


          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Company scoped
          </span>

        </div>


        {filteredDocuments.length ===
        0 ? (
          <EmptyState
            hasDocuments={
              documents.length >
              0
            }
          />
        ) : (
          <>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto lg:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <Heading>
                      Candidate
                    </Heading>

                    <Heading>
                      Filename
                    </Heading>

                    <Heading>
                      Section
                    </Heading>

                    <Heading>
                      Type
                    </Heading>

                    <Heading>
                      Size
                    </Heading>

                    <Heading>
                      Status
                    </Heading>

                    <Heading>
                      Uploaded
                    </Heading>

                    <Heading>
                      Actions
                    </Heading>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {filteredDocuments.map(
                    (document) => (
                      <DocumentRow
                        key={
                          document.id
                        }

                        document={
                          document
                        }

                        opening={
                          openingId ===
                          document.id
                        }

                        onView={() =>
                          handleViewDocument(
                            document.id
                          )
                        }
                      />
                    )
                  )}

                </tbody>

              </table>

            </div>


            {/* MOBILE / TABLET */}

            <div className="divide-y divide-slate-100 lg:hidden">

              {filteredDocuments.map(
                (document) => (
                  <DocumentMobileCard
                    key={
                      document.id
                    }

                    document={
                      document
                    }

                    opening={
                      openingId ===
                      document.id
                    }

                    onView={() =>
                      handleViewDocument(
                        document.id
                      )
                    }
                  />
                )
              )}

            </div>

          </>
        )}

      </section>

    </div>
  );
}


/* =========================================================
   DOCUMENT ROW
========================================================= */

function DocumentRow({
  document,
  opening,
  onView,
}) {
  return (
    <tr className="transition hover:bg-slate-50">

      {/* CANDIDATE */}

      <td className="px-6 py-4">

        <p className="font-semibold text-slate-900">
          {
            document.candidate_name ||
            "Candidate"
          }
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {
            document.candidate_email ||
            "No email"
          }
        </p>

      </td>


      {/* FILE */}

      <td className="max-w-[280px] px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            ▤
          </div>


          <div className="min-w-0">

            <p
              className="truncate text-sm font-medium text-slate-800"
              title={
                document.original_filename
              }
            >
              {
                document.original_filename ||
                "Unnamed file"
              }
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Secure onboarding file
            </p>

          </div>

        </div>

      </td>


      {/* SECTION */}

      <td className="px-6 py-4">

        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {
            formatSection(
              document.section
            )
          }
        </span>

      </td>


      {/* TYPE */}

      <td className="px-6 py-4 text-sm text-slate-500">
        {
          formatContentType(
            document.content_type
          )
        }
      </td>


      {/* SIZE */}

      <td className="px-6 py-4 text-sm text-slate-500">
        {
          formatBytes(
            document.verified_size
          )
        }
      </td>


      {/* STATUS */}

      <td className="px-6 py-4">

        <StatusBadge
          status={
            document.status
          }
        />

      </td>


      {/* DATE */}

      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
        {
          formatDate(
            document.created_at
          )
        }
      </td>


      {/* ACTION */}

      <td className="px-6 py-4">

        <button
          type="button"
          onClick={
            onView
          }
          disabled={
            opening
          }
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {opening
            ? "Opening..."
            : "View"}
        </button>

      </td>

    </tr>
  );
}


/* =========================================================
   MOBILE DOCUMENT CARD
========================================================= */

function DocumentMobileCard({
  document,
  opening,
  onView,
}) {
  return (
    <div className="p-5">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="font-semibold text-slate-900">
            {
              document.candidate_name ||
              "Candidate"
            }
          </p>

          <p className="mt-1 truncate text-sm text-slate-500">
            {
              document.candidate_email ||
              "No email"
            }
          </p>

        </div>


        <StatusBadge
          status={
            document.status
          }
        />

      </div>


      <div className="mt-5 rounded-xl bg-slate-50 p-4">

        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
          File
        </p>

        <p className="mt-2 break-all text-sm font-medium text-slate-800">
          {
            document.original_filename ||
            "Unnamed file"
          }
        </p>

      </div>


      <div className="mt-4 grid grid-cols-2 gap-4">

        <InfoBlock
          label="Section"
          value={
            formatSection(
              document.section
            )
          }
        />

        <InfoBlock
          label="Type"
          value={
            formatContentType(
              document.content_type
            )
          }
        />

        <InfoBlock
          label="Size"
          value={
            formatBytes(
              document.verified_size
            )
          }
        />

        <InfoBlock
          label="Uploaded"
          value={
            formatDate(
              document.created_at
            )
          }
        />

      </div>


      <button
        type="button"
        onClick={
          onView
        }
        disabled={
          opening
        }
        className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {opening
          ? "Opening secure document..."
          : "View secure document"}
      </button>

    </div>
  );
}


/* =========================================================
   INFO BLOCK
========================================================= */

function InfoBlock({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   TABLE HEADING
========================================================= */

function Heading({
  children,
}) {
  return (
    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
      {children}
    </th>
  );
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}) {
  const statusConfig = {
    UPLOADED: {
      label:
        "Uploaded",

      className:
        "bg-emerald-50 text-emerald-700",
    },

    VERIFIED: {
      label:
        "Verified",

      className:
        "bg-blue-50 text-blue-700",
    },

    PROCESSING: {
      label:
        "Processing",

      className:
        "bg-violet-50 text-violet-700",
    },

    FAILED: {
      label:
        "Failed",

      className:
        "bg-red-50 text-red-700",
    },
  };


  const current =
    statusConfig[status] || {
      label:
        status ||
        "Unknown",

      className:
        "bg-slate-100 text-slate-700",
    };


  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${current.className}`}
    >
      {current.label}
    </span>
  );
}


/* =========================================================
   METRIC CARD
========================================================= */

function Metric({
  label,
  value,
  tone,
}) {
  const tones = {
    blue:
      "bg-blue-50 text-blue-600",

    emerald:
      "bg-emerald-50 text-emerald-600",

    violet:
      "bg-violet-50 text-violet-600",

    cyan:
      "bg-cyan-50 text-cyan-600",
  };


  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

        </div>


        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl font-bold ${tones[tone]}`}
        >
          ▤
        </div>

      </div>

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasDocuments,
}) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        ▤
      </div>


      <h4 className="mt-5 font-semibold text-slate-900">

        {hasDocuments
          ? "No matching documents"
          : "No secure documents found"}

      </h4>


      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">

        {hasDocuments
          ? "Try changing your search or document-section filter."
          : "Uploaded onboarding documents for this company will appear here."}

      </p>

    </div>
  );
}


/* =========================================================
   FORMAT SECTION
========================================================= */

function formatSection(
  section
) {
  if (!section) {
    return "Unknown";
  }


  if (
    section ===
    "DRIVERS_LICENSE"
  ) {
    return "Driver's License";
  }


  if (
    section ===
    "PROFILE_PHOTO"
  ) {
    return "Profile Photo";
  }


  if (
    section ===
    "SELFIE"
  ) {
    return "Selfie";
  }


  if (
    section ===
    "LEGAL_DOCUMENTS"
  ) {
    return "Legal Documents";
  }


  return section
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


/* =========================================================
   FORMAT CONTENT TYPE
========================================================= */

function formatContentType(
  contentType
) {
  if (!contentType) {
    return "—";
  }


  const knownTypes = {
    "image/jpeg":
      "JPEG image",

    "image/jpg":
      "JPG image",

    "image/png":
      "PNG image",

    "application/pdf":
      "PDF",
  };


  return (
    knownTypes[
      contentType
    ] ||
    contentType
  );
}


/* =========================================================
   FORMAT BYTES
========================================================= */

function formatBytes(
  bytes
) {
  if (
    bytes === null ||
    bytes === undefined
  ) {
    return "—";
  }


  const number =
    Number(
      bytes
    );


  if (
    Number.isNaN(
      number
    )
  ) {
    return "—";
  }


  if (
    number < 1024
  ) {
    return `${number} B`;
  }


  if (
    number <
    1024 * 1024
  ) {
    return `${(
      number /
      1024
    ).toFixed(1)} KB`;
  }


  if (
    number <
    1024 *
      1024 *
      1024
  ) {
    return `${(
      number /
      (
        1024 *
        1024
      )
    ).toFixed(1)} MB`;
  }


  return `${(
    number /
    (
      1024 *
      1024 *
      1024
    )
  ).toFixed(1)} GB`;
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }


  return date.toLocaleString(
    undefined,
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  );
}