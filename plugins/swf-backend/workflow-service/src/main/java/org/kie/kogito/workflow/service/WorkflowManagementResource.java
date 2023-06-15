package org.kie.kogito.workflow.service;

import java.util.List;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;

import org.kie.kogito.process.Processes;
import org.kie.kogito.workflow.api.ProcessMetadataDTO;

@Path("/management/processes")
public class WorkflowManagementResource {

    private Processes processes;

    @Inject
    public WorkflowManagementResource(Processes processes) {
        this.processes = processes;
    }

    @GET
    @Path("/")
    public List<ProcessMetadataDTO> getProcessesIds() {
        return processes.processIds().stream()
                .map(processes::processById)
                .map(p -> new ProcessMetadataDTO(p.id(), p.name()))
                .collect(Collectors.toList());
    }
}
