from bson import ObjectId

from app.db.mongodb import (
    get_database,
)


def list_company_documents(
    company_id: str,
):
    db = get_database()


    company_object_id = (
        ObjectId(
            company_id
        )
    )


    cursor = (
        db.onboarding_files
        .find(
            {
                "company_id":
                    company_object_id,
            }
        )
        .sort(
            "created_at",
            -1,
        )
    )


    results = []


    for document in cursor:

        candidate_id = (
            document.get(
                "candidate_id"
            )
        )


        candidate = None


        if candidate_id:
            candidate = (
                db.candidates.find_one(
                    {
                        "_id":
                            candidate_id,

                        "company_id":
                            company_object_id,
                    }
                )
            )


        candidate_name = (
            "Candidate"
        )

        candidate_email = ""


        if candidate:
            candidate_name = (
                " ".join(
                    [
                        candidate.get(
                            "first_name",
                            "",
                        ),

                        candidate.get(
                            "last_name",
                            "",
                        ),
                    ]
                ).strip()
                or
                candidate.get(
                    "name",
                    "Candidate",
                )
            )


            candidate_email = (
                candidate.get(
                    "email",
                    "",
                )
            )


        results.append(
            {
                "id":
                    str(
                        document["_id"]
                    ),

                "candidate_id":
                    str(
                        candidate_id
                    )
                    if candidate_id
                    else "",

                "application_id":
                    str(
                        document.get(
                            "application_id"
                        )
                    )
                    if document.get(
                        "application_id"
                    )
                    else None,

                "candidate_name":
                    candidate_name,

                "candidate_email":
                    candidate_email,

                "section":
                    document.get(
                        "section",
                        "",
                    ),

                "original_filename":
                    document.get(
                        "original_filename",
                        "",
                    ),

                "content_type":
                    document.get(
                        "content_type",
                        "",
                    ),

                "verified_size":
                    document.get(
                        "verified_size"
                    ),

                "status":
                    document.get(
                        "status",
                        "",
                    ),

                "created_at":
                    document.get(
                        "created_at"
                    ),
            }
        )


    return results