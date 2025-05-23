<script setup>
  import { project } from '@/config/project'

  useSeoMeta({
    title: 'Terms of Service',

    description: `Terms of Service of ${project.name}`
  })
</script>

<template>
  <main class="prose prose-invert container mx-auto max-w-3xl flex-1 px-4 py-4 sm:px-6 lg:px-8">
    <PageHeader>
      <template #title>Terms of Service</template>
    </PageHeader>

    <p>
      These Terms of Service govern your use of the website located at
      <a :href="project.urls.production.toString()">{{ project.urls.production.toString() }}</a> and any related
      services provided by {{ project.name }}.
    </p>
    <p>
      By accessing <a :href="project.urls.production.toString()">{{ project.urls.production.toString() }}</a
      >, you agree to abide by these Terms of Service and to comply with all applicable laws and regulations. If you do
      not agree with these Terms of Service, you are prohibited from using or accessing this website or using any other
      services provided by {{ project.name }}.
    </p>
    <p>
      We, {{ project.name }}, reserve the right to review and amend any of these Terms of Service at our sole
      discretion. Upon doing so, we will update this page. Any changes to these Terms of Service will take effect
      immediately from the date of publication.
    </p>
    <p>These Terms of Service were last updated on 2 March 2021.</p>

    <h2>Limitations of Use</h2>
    <p>
      By using this website, you warrant on behalf of yourself, your users, and other parties you represent the
      following:
    </p>
    <ol>
      <li>That you are eighteen (18) or twenty-one (21) years of age (whichever is applicable) or older</li>
      <li>
        That you are familiar with all of the local laws in your area affecting your legal right to access erotic or
        adult-oriented or obscene materials
      </li>
      <li>
        That you have the legal right to access erotic or adult-oriented or obscene materials and we have the legal
        right to transmit them to you; that you are requesting erotic or adult-oriented or obscene materials for your
        own private enjoyment and that you will NEVER share these materials with a minor or in ANY WAY make these
        materials available IN ANY FORM WHATSOEVER to a minor
      </li>
    </ol>

    <p>And that you will not:</p>
    <ol>
      <li>
        modify, copy, prepare derivative works of, decompile, or reverse engineer any materials and software contained
        on this website;
      </li>
      <li>remove any copyright or other proprietary notations from any materials and software on this website;</li>
      <li>transfer the materials to another person or "mirror" the materials on any other server;</li>
      <li>
        knowingly or negligently use this website or any of its associated services in a way that abuses or disrupts our
        networks or any other service {{ project.name }} provides;
      </li>
      <li>
        use this website or its associated services to transmit or publish any harassing, indecent, obscene, fraudulent,
        or unlawful material;
      </li>
      <li>use this website or its associated services in violation of any applicable laws or regulations;</li>
      <li>use this website in conjunction with sending unauthorized advertising or spam;</li>
      <li>harvest, collect, or gather user data without the user's consent; or</li>
      <li>
        use this website or its associated services in such a way that may infringe the privacy, intellectual property
        rights, or other rights of third parties.
      </li>
    </ol>

    <h2>Intellectual Property</h2>
    <p>
      The intellectual property in the materials contained in this website are owned by or licensed to
      {{ project.name }} and are protected by applicable copyright and trademark law. We grant our users permission to
      download one copy of the materials for personal, non-commercial transitory use.
    </p>
    <p>
      This constitutes the grant of a license, not a transfer of title. This license shall automatically terminate if
      you violate any of these restrictions or the Terms of Service, and may be terminated by {{ project.name }} at any
      time.
    </p>

    <h2>Liability</h2>
    <p>
      Our website and the materials on our website are provided on an 'as is' basis. To the extent permitted by law,
      {{ project.name }} makes no warranties, expressed or implied, and hereby disclaims and negates all other
      warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a
      particular purpose, or non-infringement of intellectual property, or other violation of rights.
    </p>
    <p>
      In no event shall {{ project.name }} or its suppliers be liable for any consequential loss suffered or incurred by
      you or any third party arising from the use or inability to use this website or the materials on this website,
      even if {{ project.name }} or an authorized representative has been notified, orally or in writing, of the
      possibility of such damage.
    </p>
    <p>
      In the context of this agreement, &ldquo;consequential loss&rdquo; includes any consequential loss, indirect loss,
      real or anticipated loss of profit, loss of benefit, loss of revenue, loss of business, loss of goodwill, loss of
      opportunity, loss of savings, loss of reputation, loss of use and/or loss or corruption of data, whether under
      statute, contract, equity, tort (including negligence), indemnity, or otherwise.
    </p>
    <p>
      Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for
      consequential or incidental damages, these limitations may not apply to you.
    </p>

    <h2>Accuracy of Materials</h2>
    <p>
      The materials appearing on our website are not comprehensive and are for general information purposes only.
      {{ project.name }}
      does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of
      the materials on this website, or otherwise relating to such materials or on any resources linked to this website.
    </p>

    <h2>Links</h2>
    <p>
      {{ project.name }} has not reviewed all of the sites linked to its website and is not responsible for the contents
      of any such linked site. The inclusion of any link does not imply endorsement, approval, or control by
      {{ project.name }} of the site. Use of any such linked site is at your own risk and we strongly advise you make
      your own investigations with respect to the suitability of those sites.
    </p>

    <h2>Right to Terminate</h2>
    <p>
      We may suspend or terminate your right to use our website and terminate these Terms of Service immediately upon
      written notice to you for any breach of these Terms of Service.
    </p>

    <h2 id="premium-subscription">Premium Subscription</h2>
    <p>
      The license key given to you via the subscription is absolutely personal and non-transferable. It could be used to
      maliciously act in your name and gather personal information, so it must be kept secret.
    </p>
    <p>
      We are in complete power to revoke or cancel your subscription if we find you to maliciously use or share your
      license key.
    </p>

    <h2>Severance</h2>
    <p>
      Any term of these Terms of Service which is wholly or partially void or unenforceable is severed to the extent
      that it is void or unenforceable. The validity of the remainder of these Terms of Service is not affected.
    </p>

    <h2>Governing Law</h2>
    <p>
      These Terms of Service are governed by and construed in accordance with the laws of Spain. You irrevocably submit
      to the exclusive jurisdiction of the courts in that State or location.
    </p>
  </main>
</template>
