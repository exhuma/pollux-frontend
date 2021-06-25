from fabric import task

@task
def develop(context):
    context.run("npm install", replace_env=False, pty=True)
    context.run("pre-commit install", replace_env=False)
