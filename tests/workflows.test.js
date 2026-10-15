/**
 * Existing npm test entry point.
 *
 * Import each member's case registrations; shared hooks create one test server.
 * The ordering follows the four ownership groups rather than duplicating the test
 * harness.
 */

// Existing npm test entry point loads the four responsibility groups.
import "./members/member1/workflows.cases.js";
import "./members/member2/workflows.cases.js";
import "./members/member3/workflows.cases.js";
import "./members/member4/workflows.cases.js";
