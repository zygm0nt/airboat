package codereview

import grails.test.mixin.Mock
import grails.test.mixin.TestFor
import spock.lang.Specification
import grails.converters.JSON

@TestFor(ChangesetController)
@Mock(Changeset)
class ChangesetControllerSpec extends Specification {

    def setup() {
        controller.changelogAccessService = Mock(ChangelogAccessService)
        controller.gitRepositoryService = Mock(GitRepositoryService)
    }

    void "list should have changesets in context"() {
        when:
            def model = controller.list()

        then:
            model.changesetInstanceList.size() == 0
            model.changesetInstanceTotal == 0
    }

    void testListWithAddedChangesets() {

        given:
            new Changeset("hash23", "agj", new Date()).save()
            new Changeset("hash24", "kpt", new Date()).save()

        when:
            def model = controller.list()

        then:
            model.changesetInstanceList.size() == 2
            model.changesetInstanceTotal == 2
    }

    def "getLastChangesets should return JSON"() {

        given:
            new Changeset("hash23", "agj", new Date()).save()
            new Changeset("hash24", "kpt", new Date()).save()
            def changesets = Changeset.list(max: 20, sort: "date", order: "desc")

        when:
            controller.getLastChangesets()

        then:
            changesets.size() == JSON.parse(response.contentAsString).size()
            response.getContentType().startsWith("application/json")
    }

    def "initial checkout should delgate to service and display index afterwards"() {

        when:
            controller.initialCheckOut()

        then:
            1 * controller.gitRepositoryService.checkoutProject(_)
            response.redirectedUrl == "/changeset/index"
    }

}
