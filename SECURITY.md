# Security

ContextCommit handles work context that may be sensitive.

Do not include credentials, secrets, personal data, or restricted company
information in public issues or example Prompt Commits.

The built-in redaction covers only common inline secret patterns and is not a
complete data-loss-prevention system.

Before configuring shared memory, confirm that the destination's access
controls, retention policy, and data classification permit the context being
stored. A synchronized folder is only a transport; ContextCommit does not
replace SharePoint, network-drive, or Git permissions.

For now, report vulnerabilities privately to the repository owner through
GitHub's private vulnerability reporting feature.
