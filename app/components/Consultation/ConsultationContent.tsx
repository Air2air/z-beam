"use client";

import { SectionContainer } from "../SectionContainer";
import { ScheduleCalendar } from "../Schedule/ScheduleCalendar";

export function ConsultationContent() {
  return (
    <>

        <SectionContainer
          title="Select a Time"
          bgColor="transparent"
          radius={false}
          horizPadding={false}
        >
          <ScheduleCalendar />
        </SectionContainer>



      {/* Right Column - Info */}
      <div className="space-y-6">
        <SectionContainer
          title="What to Expect"
          bgColor="transparent"
          radius={true}
          horizPadding={true}
        >
          <ul className="space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Free 30-minute consultation</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Discuss your specific cleaning needs</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Review material compatibility</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Get equipment recommendations</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Receive preliminary quote</span>
            </li>
          </ul>
        </SectionContainer>

        <SectionContainer
          title="Meeting Format"
          bgColor="transparent"
          radius={true}
          horizPadding={true}
        >
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p className="text-sm">
              <strong className="text-gray-900 dark:text-gray-100">
                Video Call:
              </strong>
              <br />
              We'll send you a meeting link via email
            </p>
            <p className="text-sm">
              <strong className="text-gray-900 dark:text-gray-100">
                Duration:
              </strong>
              <br />
              30 minutes (can extend if needed)
            </p>
            <p className="text-sm">
              <strong className="text-gray-900 dark:text-gray-100">
                Preparation:
              </strong>
              <br />
              No preparation needed, but photos help
            </p>
          </div>
        </SectionContainer>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <p className="text-sm text-orange-900 dark:text-orange-100">
            <strong>Can't find a suitable time?</strong>
            <br />
            Contact us directly and we'll arrange a custom slot.
          </p>
          <a
            href="/contact"
            className="text-orange-600 dark:text-orange-400 hover:underline text-sm mt-2 inline-block"
          >
            Contact Us →
          </a>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="mt-12">
        <SectionContainer
          title="Frequently Asked Questions"
          bgColor="transparent"
          radius={false}
        >
          <div className="grid-2col-md gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2">
                Do I need to prepare anything?
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                No preparation required. However, having photos of the materials
                you want to clean and any specific requirements will help us
                provide better recommendations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                What if I need to reschedule?
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                You can reschedule or cancel anytime using the link in your
                confirmation email. We recommend giving at least 24 hours
                notice.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Is this really free?</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Yes, absolutely! This is a no-obligation consultation to help
                you understand if laser cleaning is right for your application.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                Will I get a quote during the call?
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                We can provide rough estimates during the call. For detailed
                quotes, we'll need to assess your specific requirements and may
                schedule an on-site visit.
              </p>
            </div>
          </div>
        </SectionContainer>
      </div>
    </>
  );
}
