import codereview.Changeset
import codereview.Constants
import codereview.Project
import grails.converters.JSON

import static codereview.ScmAccessService.getEmail

class BootStrap {

    //FIXME add a bootstrap test, errors here are too frequent...
    def init = { servletContext ->

        JSON.registerObjectMarshaller(Changeset) { Changeset changeset ->
            def returnMap = [:]
            returnMap['identifier'] = changeset.identifier
            returnMap['author'] = changeset.commiter.cvsCommiterId
            returnMap['date'] = changeset.date
            returnMap['email'] = getEmail(changeset.commiter.cvsCommiterId) //FIXME use changeset.committer.user.email or equivalent ASAP
            returnMap['commitComment'] = changeset.commitComment
            returnMap['id'] = changeset.id
            returnMap['commentsCount'] = changeset.commentsCount()
            returnMap['projectName'] = changeset.project.name
            return returnMap
        }

        environments {
            production {
                createAndSaveConfiguredProjects()
            }
            development {
                createAndSaveConfiguredProjects()
            }
        }
    }

    private void createAndSaveConfiguredProjects() {
        new Project("codereview", Constants.PROJECT_CODEREVIEW_REPOSITORY_URL).save(flush: true)
        new Project("cyclone", Constants.PROJECT_CYCLONE_REPOSITORY_URL).save(flush: true)
    }

    def destroy = {
    }
}
