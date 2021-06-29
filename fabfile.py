from fabric import task

@task
def develop(context):
    context.run("npm install", replace_env=False, pty=True)
    context.run("pre-commit install", replace_env=False)


@task
def run(context):
    context.run("npm run serve", replace_env=False, pty=True)
