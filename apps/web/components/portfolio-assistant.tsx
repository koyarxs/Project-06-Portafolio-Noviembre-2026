import { featuredProjects, projectStatuses } from './public-work';
import { questions } from './faq-section';
import { projectStories } from '../lib/featured-project-stories';
import { owner } from '../lib/owner';
import { AssistantChat } from './assistant-chat';
import { assistantSiteTopics } from '../lib/assistant-site-topics';

function liveChatUrl(value: string | undefined) {
  const link = value?.trim();
  return link && /^https:\/\/tawk\.to\/chat\/[a-z0-9]+\/[a-z0-9]+\/?$/i.test(link) ? link : undefined;
}

export function PortfolioAssistant() {
  return <AssistantChat liveChatUrl={liveChatUrl(process.env.TAWK_DIRECT_CHAT_URL)}
    profile={owner} faqs={questions} topics={assistantSiteTopics} projects={featuredProjects.map(project => ({
    name: project.slug === 'pawly' ? 'Clínica Veterinaria Porvenir' : project.name,
    alias: project.name,
    slug: project.slug,
    description: project.description,
    status: projectStatuses[project.slug],
    layers: projectStories[project.slug].technologies,
    technical: projectStories[project.slug].technical,
    context: projectStories[project.slug].context,
    repository: project.href,
    private: Boolean(project.private),
    site: project.site,
    hasVideo: Boolean(project.video),
  }))} />;
}
