ats project initial description

->Routes

.>Resume_Routes
get api/resume/history -get all resumes
get api/resume/:id -get resume based on id
delete api/resume/:id -delete resume based on id
delete api/resume/all -delete all resumes
post api/resume/upload -upload resume to s3, call ats and if(user) upload to supabase else give score and delete from s3

.>Analysis_Routes
post api/analysis/run -run new analysis on existing resume
delete api/analysis/:id -delete analysis based on id
delete api/analysis/resume/:resumeId -delete all analysis for a resume
get api/analysis/:id -get analysis based on id
get api/analysis/resume/:resumeId -get all analysis for a resume
get api/analysis/:id/jd -get JD data by analysis ID
get api/analysis/resume/:resumeId/jd -get JD data by resume ID

-->userRoutes
post api/users/signup --> post email and password for accout creation
post api/users/login  --> post email and password to login
post api/users/logout --> just hit route to logout
post api/users/forgot --> post email to get a new password to the respective mail
post api/users/change --> post oldPassword and newPassword after login to change current password
