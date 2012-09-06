package codereview

import grails.plugin.spock.IntegrationSpec

class ProjectFileControllerIntegrationSpec extends IntegrationSpec {

    def scmAccessService
    def snippetWithCommentsService
    def diffAccessService

    ProjectFileController controller = new ProjectFileController(
            scmAccessService: scmAccessService,
            snippetWithCommentsService: snippetWithCommentsService,
            diffAccessService: diffAccessService
    )

    Project project = Project.build()
    ProjectFile projectFile = ProjectFile.buildWithoutSave(name: 'groovy.groovy', project: project)
    LineComment comment = LineComment.build(text: 'first comment')

    def 'should return Comments for ProjectFile with their position in given Changeset'() {
        given:
        Changeset firstChangeset = Changeset.build(project: project)
        Changeset secondChangeset = Changeset.build(project: project)

        buildThreadWithPosition(firstChangeset, 13)
        buildThreadWithPosition(secondChangeset, 42)

        when:
        def comments = controller.getLineComments(firstChangeset, projectFile)

        then:
        comments*.lineNumber == firstChangeset.projectFilesInChangeset*.commentThreadsPositions.flatten()*.lineNumber

        when:
        comments = controller.getLineComments(secondChangeset, projectFile)

        then:
        comments*.lineNumber == secondChangeset.projectFilesInChangeset*.commentThreadsPositions.flatten()*.lineNumber
    }

    private void buildThreadWithPosition(Changeset changeset, int lineNumber) {
        def projectFileInChangeset = ProjectFileInChangeset.build(changeset: changeset, projectFile: projectFile)
        ThreadPositionInFile.build(
                projectFileInChangeset: projectFileInChangeset,
                'thread.comments': [comment],
                lineNumber: lineNumber
        )
    }
}
